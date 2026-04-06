import TabLikeButtonsV1 from 'src/components/tab-like-buttons/tab-like-buttons-v1.vue'
import MarkdownViewer from 'src/components/markdown/markdown-viewer.vue'
import MarkdownEditor from 'src/components/markdown/markdown-editer.vue'
import MarkdownTabViewer from 'src/components/markdown/markdown-tab-viewer.vue'
import MarkdownCodeBlock from 'src/components/code-block/code-block-v1.vue'
export const register_component = (app) => {
  app.component('TabLikeButtonsV1', TabLikeButtonsV1)
  app.component('MarkdownViewer', MarkdownViewer)
  app.component('MarkdownEditor', MarkdownEditor)
  app.component('MarkdownTabViewer', MarkdownTabViewer)
  app.component('MarkdownCodeBlock', MarkdownCodeBlock)
}
