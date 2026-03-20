import TabLikeButtonsV1 from 'src/components/tab-like-buttons/tab-like-buttons-v1.vue'
import MarkdownViewer from 'src/components/markdown/markdown-viewer.vue'
import MarkdownEditor from 'src/components/markdown/markdown-editer.vue'
export const register_component = (app) => {
  app.component('TabLikeButtonsV1', TabLikeButtonsV1)
  app.component('MarkdownViewer', MarkdownViewer)
  app.component('MarkdownEditor', MarkdownEditor)
}
