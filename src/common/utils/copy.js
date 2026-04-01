import { copyToClipboard, Notify } from 'quasar'

/**
 * @typedef {Object} NotifyOptions
 * @property {boolean} [showSuccess] - Whether to show a notification on successful copy. Default is true.
 * @property {boolean} [showFailure] - Whether to show a notification on failed copy. Default is true.
 * @property {string} [successMessage] - Custom success message.
 * @property {string} [failureMessage] - Custom failure message.
 */

/**
 * Default notification options.
 * @type {NotifyOptions}
 */
const defaultNotifyOptions = {
  showSuccess: true,
  showFailure: true,
  successMessage: '已复制到剪贴板',
  failureMessage: '复制失败!',
}

/**
 * Shows a Quasar notification.
 * @param {'positive' | 'negative'} type - The type of notification.
 * @param {string} message - The message to display.
 */
const showNotification = (type, message) => {
  Notify.create({
    type,
    message,
    position: 'top',
    timeout: 1500,
    progress: true,
  })
}

/**
 * Copies a given text string to the clipboard.
 * @param {string} text - The text to be copied.
 * @param {NotifyOptions} [options] - Notification options.
 * @returns {Promise<void>} A promise that resolves when the text is copied.
 */
export const copyText = async (text, options = {}) => {
  const finalOptions = { ...defaultNotifyOptions, ...options }
  try {
    await copyToClipboard(text)
    if (finalOptions.showSuccess) {
      showNotification('positive', finalOptions.successMessage)
    }
  } catch (e) {
    if (finalOptions.showFailure) {
      showNotification('negative', finalOptions.failureMessage)
    }
    // Re-throw the error so the caller can handle it if needed
    throw e
  }
}

/**
 * Copies the text content of a DOM element to the clipboard.
 * @param {string | HTMLElement} selectorOrElement - A CSS selector or the HTML element itself.
 * @param {NotifyOptions} [options] - Notification options.
 * @returns {Promise<void>} A promise that resolves when the content is copied.
 */
export const copyDomContent = async (selectorOrElement, options = {}) => {
  const element =
    typeof selectorOrElement === 'string'
      ? document.querySelector(selectorOrElement)
      : selectorOrElement

  if (!element) {
    const finalOptions = { ...defaultNotifyOptions, ...options }
    if (finalOptions.showFailure) {
      showNotification('negative', '错误: 未找到指定的DOM元素')
    }
    throw new Error('DOM element not found.')
  }

  const textToCopy = element.innerText || element.textContent
  await copyText(textToCopy, options)
}

/**
 * Creates a "copy" button as a Vue component options object.
 * Useful for dynamically adding a copy button inside other components (e.g., QInput append slot).
 * @param {() => string} getTextFn - A function that returns the text to be copied.
 * @param {NotifyOptions} [options] - Notification options.
 * @returns {{icon: string, flat: boolean, round: boolean, dense: boolean, onClick: () => Promise<void>}}
 */
export const createCopyButton = (getTextFn, options = {}) => {
  return {
    icon: 'content_copy',
    flat: true,
    round: true,
    dense: true,
    onClick: async () => {
      try {
        const text = getTextFn()
        await copyText(text, options)
      } catch (e) {
        console.error('Copy button error:', e)
      }
    },
  }
}
