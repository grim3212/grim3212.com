// One entry point for deploying, used both locally and by GitHub Actions.
//
//   node scripts/deploy.mjs full      cdk deploy, then upload the site
//   node scripts/deploy.mjs web       upload the site only (no infrastructure changes)
//   node scripts/deploy.mjs destroy   empty the site bucket, then cdk destroy
//
// Build the site first (`yarn generate`). Locally this uses the "default" AWS CLI profile (or
// AWS_PROFILE); in CI (CI=true) it uses whatever credentials the workflow configured.
//
// The site is uploaded with plain `aws s3 sync` instead of CDK's BucketDeployment, which would
// add helper Lambdas and roles with generated names.
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const STACK = 'Grim3212'
const REGION = 'us-west-2'
const PROFILE = process.env.AWS_PROFILE || 'default'

const ci = Boolean(process.env.CI)
const rootDir = fileURLToPath(new URL('..', import.meta.url))
const dist = fileURLToPath(new URL('../.output/public', import.meta.url))
const profileArgs = ci ? [] : ['--profile', PROFILE]

function run(cmd, args, opts = {}) {
  // Only the command itself: the arguments include resource ids, and CI logs are public.
  console.log(`> ${cmd === process.execPath ? 'cdk' : cmd} ${args.slice(0, 2).join(' ')}`)
  return execFileSync(cmd, args, { stdio: 'inherit', cwd: rootDir, ...opts })
}

const aws = (...args) => run('aws', [...args, ...profileArgs, '--region', REGION])

const cdkBin = createRequire(import.meta.url).resolve('aws-cdk/bin/cdk')
// CI can't answer CDK's "approve these IAM changes?" prompt; locally you still get asked.
const cdk = (...args) =>
  run(process.execPath, [cdkBin, ...args, ...profileArgs, ...(ci ? ['--require-approval', 'never'] : [])])

function stackOutputs() {
  const json = execFileSync(
    'aws',
    ['cloudformation', 'describe-stacks', '--stack-name', STACK, '--query', 'Stacks[0].Outputs',
      '--output', 'json', ...profileArgs, '--region', REGION],
    { encoding: 'utf8' },
  )
  return Object.fromEntries(JSON.parse(json).map(o => [o.OutputKey, o.OutputValue]))
}

function uploadSite() {
  if (!existsSync(`${dist}/index.html`)) throw new Error('.output/public is missing. Run `yarn generate` first.')
  const { SiteBucket: bucket, DistributionId: distributionId } = stackOutputs()

  // Hashed bundles first, so no page can reference a file that is not up yet. They never change,
  // so browsers can keep them for a year.
  aws('s3', 'sync', `${dist}/_nuxt`, `s3://${bucket}/_nuxt`, '--delete', '--no-progress',
    '--cache-control', 'public,max-age=31536000,immutable')
  // Everything else (pages, pictures, icons) for five minutes; the invalidation below clears CloudFront.
  aws('s3', 'sync', dist, `s3://${bucket}`, '--delete', '--no-progress',
    '--exclude', '_nuxt/*', '--cache-control', 'public,max-age=300')
  aws('cloudfront', 'create-invalidation', '--distribution-id', distributionId, '--paths', '/*',
    '--query', 'Invalidation.Id', '--output', 'text')
}

// CI logs are public: hide the stack's outputs (distribution id and so on), which CDK prints.
// The very first deploy has no outputs to hide yet, so make that one locally.
function maskOutputs() {
  if (!ci) return
  try {
    for (const value of Object.values(stackOutputs())) console.log(`::add-mask::${value}`)
  }
  catch {
    // No stack yet (first deploy).
  }
}

maskOutputs()
switch (process.argv[2]) {
  case 'full':
    // Re-read the bootstrap version from this site's own bootstrap instead of the value saved on the
    // stack (which can point at another bootstrap this site's role isn't allowed to read). The stacks
    // have no other parameters, so nothing else is reset.
    cdk('deploy', STACK, '--no-previous-parameters')
    uploadSite()
    break
  case 'web':
    uploadSite()
    break
  case 'destroy': {
    const { SiteBucket: bucket } = stackOutputs()
    aws('s3', 'rm', `s3://${bucket}`, '--recursive')
    cdk('destroy', STACK)
    break
  }
  default:
    console.error('Usage: node scripts/deploy.mjs full|web|destroy')
    process.exit(1)
}
