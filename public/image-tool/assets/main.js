var selectedImages = [];
var uploadBtn = document.getElementById('uploadBtn');
var fileInput = document.getElementById('fileInput');
var previewSection = document.getElementById('previewSection');
var thumbnails = document.getElementById('thumbnails');
var clearBtn = document.getElementById('clearBtn');
var mergeBtn = document.getElementById('mergeBtn');
var resultSection = document.getElementById('resultSection');
var resultImage = document.getElementById('resultImage');
var backBtn = document.getElementById('backBtn');

uploadBtn.addEventListener('click', function() {
  fileInput.click();
});

fileInput.addEventListener('change', function(e) {
  var files = e.target.files;
  if (files.length === 0) return;
  
  var remainingSlots = 9 - selectedImages.length;
  var filesToProcess = Math.min(files.length, remainingSlots);
  
  if (selectedImages.length + files.length > 9) {
    alert('最多只能选择9张图片');
  }
  
  for (var i = 0; i < filesToProcess; i++) {
    var file = files[i];
    if (file.type.startsWith('image/')) {
      processImage(file);
    }
  }
  
  fileInput.value = '';
});

function processImage(file) {
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      selectedImages.push(img);
      addThumbnail(e.target.result);
      updatePreview();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function addThumbnail(src) {
  var thumb = document.createElement('img');
  thumb.className = 'thumbnail';
  thumb.src = src;
  thumbnails.appendChild(thumb);
}

function updatePreview() {
  if (selectedImages.length > 0) {
    previewSection.style.display = 'block';
  }
}

clearBtn.addEventListener('click', function() {
  selectedImages = [];
  thumbnails.innerHTML = '';
  previewSection.style.display = 'none';
});

mergeBtn.addEventListener('click', function() {
  if (selectedImages.length < 2) {
    alert('请至少选择2张图片');
    return;
  }
  mergeImages();
});

backBtn.addEventListener('click', function() {
  resultSection.style.display = 'none';
  previewSection.style.display = 'block';
});

function getLayout(count) {
  switch(count) {
    case 2: return [{cols: 2, count: 2}];
    case 3: return [{cols: 2, count: 2}, {cols: 1, count: 1}];
    case 4: return [{cols: 2, count: 2}, {cols: 2, count: 2}];
    case 5: return [{cols: 2, count: 2}, {cols: 3, count: 3}];
    case 6: return [{cols: 3, count: 3}, {cols: 3, count: 3}];
    case 7: return [{cols: 3, count: 3}, {cols: 3, count: 3}, {cols: 1, count: 1}];
    case 8: return [{cols: 3, count: 3}, {cols: 3, count: 3}, {cols: 2, count: 2}];
    case 9: return [{cols: 3, count: 3}, {cols: 3, count: 3}, {cols: 3, count: 3}];
    default: return [{cols: 1, count: count}];
  }
}

function mergeImages() {
  var count = selectedImages.length;
  var layout = getLayout(count);
  
  var canvasWidth = 1080;
  var cellWidth = canvasWidth / 3;
  
  var totalRows = layout.length;
  var rowHeights = [];
  var totalHeight = 0;
  
  for (var r = 0; r < totalRows; r++) {
    rowHeights[r] = cellWidth;
    totalHeight += cellWidth;
  }
  
  var canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = totalHeight;
  
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, totalHeight);
  
  var imgIndex = 0;
  var currentY = 0;
  
  for (var row = 0; row < layout.length; row++) {
    var rowConfig = layout[row];
    var cols = rowConfig.cols;
    var cellW = canvasWidth / cols;
    var cellH = rowHeights[row];
    
    for (var col = 0; col < cols && imgIndex < count; col++) {
      var img = selectedImages[imgIndex];
      var x = col * cellW;
      var y = currentY;
      
      drawImageCover(ctx, img, x, y, cellW, cellH);
      
      imgIndex++;
    }
    
    currentY += cellH;
  }
  
  resultImage.src = canvas.toDataURL('image/jpeg', 0.9);
  previewSection.style.display = 'none';
  resultSection.style.display = 'block';
}

function drawImageCover(ctx, img, x, y, w, h) {
  var imgRatio = img.width / img.height;
  var targetRatio = w / h;
  
  var sx, sy, sWidth, sHeight;
  
  if (imgRatio > targetRatio) {
    sHeight = img.height;
    sWidth = img.height * targetRatio;
    sx = (img.width - sWidth) / 2;
    sy = 0;
  } else {
    sWidth = img.width;
    sHeight = img.width / targetRatio;
    sx = 0;
    sy = (img.height - sHeight) / 2;
  }
  
  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
}



