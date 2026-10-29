import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib'
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager'
import {
  CachePolicy,
  Distribution,
  Function as CfFunction,
  FunctionCode,
  FunctionEventType,
  HttpVersion,
  PriceClass,
  ResponseHeadersPolicy,
  S3OriginAccessControl,
  Signing,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront'
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins'
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'
import type { Construct } from 'constructs'

export interface SiteConfig {
  /** The canonical domain, e.g. grim3212.com. */
  domainName: string
  /** Extra domains that redirect to domainName, e.g. ["www.grim3212.com"]. */
  redirectDomains: string[]
  /** ACM certificate (us-east-1, as CloudFront requires) covering every domain above. */
  certificateArn: string
  /**
   * Whether the distribution answers for the domains above. A domain can only be on one
   * distribution at a time, so a new stack can start with false and be checked on its
   * cloudfront.net address first.
   */
  attachDomain: boolean
}

/** Every resource gets an explicit "grim3212-*" name so the console is readable. */
export const RESOURCE_PREFIX = 'grim3212'

/** "grim3212.com" -> "grim3212-com" (dashes, so HTTPS to S3 never trips on dots). */
export const siteBucketName = (domainName: string) => domainName.replace(/\./g, '-')

export class SiteStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps & { config: SiteConfig }) {
    super(scope, id, props)
    const { config } = props
    const name = (suffix: string) => `${RESOURCE_PREFIX}-${suffix}`

    // The site is uploaded by scripts/deploy.mjs (aws s3 sync) after `cdk deploy`. CDK's
    // BucketDeployment would add helper Lambdas and roles with generated names.
    const bucket = new Bucket(this, 'Site', {
      bucketName: siteBucketName(config.domainName),
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      // `yarn destroy` empties it first (autoDeleteObjects would add an unnamed helper Lambda).
      removalPolicy: RemovalPolicy.DESTROY,
    })

    // Redirect domains (www) go to the canonical domain. Every other path maps onto the files
    // `nuxt generate` writes: /grim-pack/ and /grim-pack -> /grim-pack/index.html; files with an extension are
    // left alone. Other hosts (the cloudfront.net address) are served as they are.
    const routes = new CfFunction(this, 'Routes', {
      functionName: name('routes'),
      code: FunctionCode.fromInline(`
var REDIRECT_HOSTS = ${JSON.stringify(config.redirectDomains)};
function handler(event) {
  var req = event.request;
  var host = req.headers.host && req.headers.host.value;
  if (host && REDIRECT_HOSTS.indexOf(host) !== -1) {
    var qs = Object.keys(req.querystring).map(function (k) {
      var v = req.querystring[k];
      return encodeURIComponent(k) + (v.value === undefined || v.value === '' ? '' : '=' + encodeURIComponent(v.value));
    }).join('&');
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: { location: { value: 'https://' + ${JSON.stringify(config.domainName)} + req.uri + (qs ? '?' + qs : '') } },
    };
  }
  var uri = req.uri;
  if (uri.charAt(uri.length - 1) === '/') req.uri = uri + 'index.html';
  else if (uri.slice(uri.lastIndexOf('/') + 1).indexOf('.') === -1) req.uri = uri + '/index.html';
  return req;
}`),
    })

    // The Content-Security-Policy itself is a <meta> tag in each page (see infra/lib/csp.ts).
    const headers = ResponseHeadersPolicy.fromResponseHeadersPolicyId(
      this,
      'Headers',
      // The security headers policy is managed outside this repo; its id is read from SSM at deploy time.
      StringParameter.valueForStringParameter(this, '/grim3212/headers-policy-id'),
    )

    const originAccessControl = new S3OriginAccessControl(this, 'SiteOac', {
      originAccessControlName: name('site'),
      signing: Signing.SIGV4_ALWAYS,
    })

    // CloudFront distributions have no name, only an AWS-assigned id; the comment labels it.
    const distribution = new Distribution(this, 'Cdn', {
      comment: config.domainName,
      ...(config.attachDomain
        ? {
            domainNames: [config.domainName, ...config.redirectDomains],
            certificate: Certificate.fromCertificateArn(this, 'Cert', config.certificateArn),
          }
        : {}),
      priceClass: PriceClass.PRICE_CLASS_100, // US/Canada/Europe edges only: the cheapest tier
      httpVersion: HttpVersion.HTTP2_AND_3,
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(bucket, { originAccessControl }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        // Honors each object's Cache-Control (set by deploy.mjs).
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: headers,
        functionAssociations: [{ function: routes, eventType: FunctionEventType.VIEWER_REQUEST }],
      },
      // A private bucket answers 403 for missing files.
      errorResponses: [403, 404].map(httpStatus => ({
        httpStatus,
        responseHttpStatus: 404,
        responsePagePath: '/404.html',
        ttl: Duration.minutes(5),
      })),
    })

    new CfnOutput(this, 'CloudflareCname', {
      value: distribution.distributionDomainName,
      description: 'In Cloudflare: CNAME the apex (@) and www to this value',
    })
    new CfnOutput(this, 'SiteUrl', { value: `https://${config.domainName}` })
    // Read by scripts/deploy.mjs.
    new CfnOutput(this, 'SiteBucket', { value: bucket.bucketName })
    new CfnOutput(this, 'DistributionId', { value: distribution.distributionId })
  }
}
