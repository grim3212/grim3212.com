export default defineEventHandler(event =>
  grimpackChapter(getRouterParam(event, 'part')!, getRouterParam(event, 'chapter')!),
)
