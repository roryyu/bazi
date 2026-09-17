(function () {
  const cssStatus = document.getElementById('css-status');
  const jsStatus = document.getElementById('js-status');

  // 检测 CSS 是否加载成功（通过 body 背景色判断）
  setTimeout(function () {
    const bg = getComputedStyle(document.body).backgroundImage;
    if (bg && bg.indexOf('gradient') !== -1) {
      cssStatus.textContent = 'CSS: 加载成功';
      cssStatus.style.background = 'rgba(34, 197, 94, 0.4)';
    } else {
      cssStatus.textContent = 'CSS: 加载失败';
      cssStatus.style.background = 'rgba(239, 68, 68, 0.4)';
    }
  }, 100);

  // JS 执行到这里说明 script.js 加载成功
  jsStatus.textContent = 'JS: 加载成功';
  jsStatus.style.background = 'rgba(34, 197, 94, 0.4)';

  console.log('[proxy test] script.js 已加载执行');
})();
