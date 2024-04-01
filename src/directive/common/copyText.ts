/**
 * v-copyText 复制文本内容
 * Copyright (c) 2022 FMS
 */

export default {
  beforeMount(el: any, { value, arg }: any) {
    if (arg === 'callback') {
      el.$copyCallback = value;
    } else {
      el.$copyValue = value;
      const handler = () => {
        copyTextToClipboard(el.$copyValue);
        if (el.$copyCallback) {
          el.$copyCallback(el.$copyValue);
        }
      };
      el.addEventListener('click', handler);
      el.$destroyCopy = () => el.removeEventListener('click', handler);
    }
  }
};

function copyTextToClipboard(input: string, { target = document.body } = {}) {
  const element = document.createElement('textarea');
  const previouslyFocusedElement = document.activeElement as HTMLInputElement;
  element.value = input;
  // Prevent keyboard from showing on mobile
  element.setAttribute('readonly', '');

  element.style.contain = 'strict';
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  element.style.fontSize = '12pt'; // Prevent zooming on iOS

  const selection = document.getSelection();
  let originalRange;
  if (selection) {
    originalRange = selection?.rangeCount > 0 && selection.getRangeAt(0);
  }
  target.append(element);
  element.select();

  // Explicit selection workaround for iOS
  element.selectionStart = 0;
  element.selectionEnd = input.length;

  let isSuccess = false;
  try {
    isSuccess = document.execCommand('copy');
  } catch (err) {
    console.error(err);
  }
  element.remove();

  if (originalRange) {
    selection?.removeAllRanges();
    selection?.addRange(originalRange);
  }

  // Get the focus back on the previously focused element, if any
  if (previouslyFocusedElement) {
    previouslyFocusedElement.focus();
  }
  return isSuccess;
}
