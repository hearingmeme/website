// ==================== MEME GENERATOR ====================

document.addEventListener('DOMContentLoaded', () => {
  const memeOverlay = document.getElementById('memeOverlay');
  const closeMemeBtn = document.getElementById('closeMemeBtn');
  const memeTrigger = document.getElementById('memeTrigger');
  const uploadBg = document.getElementById('uploadBg');
  const canvasContainer = document.getElementById('canvasContainer');
  const addTextBtn = document.getElementById('addText');
  const clearCanvasBtn = document.getElementById('clearCanvas');
  const downloadMemeBtn = document.getElementById('downloadMeme');
  const toolBtns = document.querySelectorAll('.tool-btn');

  let selectedElement = null;

  // ==================== OVERLAY MANAGEMENT ====================
  
  if (memeTrigger && memeOverlay) {
    memeTrigger.addEventListener('click', (e) => {
      e.preventDefault();
    });
  }

  if (closeMemeBtn && memeOverlay) {
    closeMemeBtn.addEventListener('click', () => {
      memeOverlay.classList.remove('active');
    });
  }

  if (memeOverlay) {
    memeOverlay.addEventListener('click', (e) => {
      if (e.target === memeOverlay) {
        memeOverlay.classList.remove('active');
      }
    });
  }

  // ==================== BACKGROUND UPLOAD ====================
  
  if (uploadBg) {
    uploadBg.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        let bgImg = document.getElementById('bgImage');
        
        if (!bgImg) {
          bgImg = document.createElement('img');
          bgImg.id = 'bgImage';
          bgImg.style.position = 'absolute';
          bgImg.style.inset = '0';
          bgImg.style.width = '100%';
          bgImg.style.height = '100%';
          bgImg.style.objectFit = 'contain';
          canvasContainer.appendChild(bgImg);
        }

        bgImg.src = ev.target.result;
        bgImg.onload = () => {
          const w = bgImg.naturalWidth;
          const h = bgImg.naturalHeight;
          const ratio = Math.min(1, (window.innerWidth * 0.9) / w, (window.innerHeight * 0.75) / h);
          
          canvasContainer.style.width = w * ratio + 'px';
          canvasContainer.style.height = h * ratio + 'px';
          canvasContainer.style.maxWidth = '100%';
          canvasContainer.style.maxHeight = '75vh';
        };
      };
      reader.readAsDataURL(file);
    });
  }

  // ==================== TOOL BUTTONS ====================
  
  toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      const wrapper = createMemeElement(type, btn.dataset);
      canvasContainer.appendChild(wrapper);
      selectElement(wrapper);
    });
  });

  // ==================== ADD TEXT ====================
  
  if (addTextBtn) {
    addTextBtn.addEventListener('click', () => {
      const text = prompt('Enter meme text:', 'HEARING THINGS') || '';
      if (text.trim()) {
        const wrapper = createMemeElement('text', { text });
        canvasContainer.appendChild(wrapper);
        selectElement(wrapper);
      }
    });
  }

  // ==================== CLEAR CANVAS ====================
  
  if (clearCanvasBtn) {
    clearCanvasBtn.addEventListener('click', () => {
      if (confirm('Clear all elements? Background will be kept.')) {
        const bg = document.getElementById('bgImage');
        canvasContainer.innerHTML = '';
        if (bg) canvasContainer.appendChild(bg);
        selectedElement = null;
      }
    });
  }

  // ==================== DOWNLOAD MEME ====================
  
  if (downloadMemeBtn) {
    downloadMemeBtn.addEventListener('click', () => {
      downloadMeme();
    });
  }

  // ==================== CREATE MEME ELEMENT ====================
  
  function createMemeElement(type, data = {}) {
    const wrapper = document.createElement('div');
    wrapper.className = 'meme-element';
    wrapper.style.position = 'absolute';
    wrapper.style.left = '100px';
    wrapper.style.top = '100px';
    wrapper.style.width = type === 'text' ? '320px' : '180px';
    wrapper.style.height = type === 'text' ? '120px' : '180px';
    wrapper.style.minWidth = '80px';
    wrapper.style.minHeight = '60px';
    wrapper.style.resize = 'both';
    wrapper.style.overflow = 'auto';
    wrapper.style.cursor = 'move';
    wrapper.style.touchAction = 'none';
    wrapper.style.userSelect = 'none';
    wrapper._rotation = 0;
    wrapper.style.transformOrigin = 'center center';

    makeDraggable(wrapper);
    makeResizable(wrapper);
    makeRotatable(wrapper);
    addDeleteBtn(wrapper);
    addSelectHandler(wrapper);

    let content;
    
    if (type === 'image') {
      content = document.createElement('img');
      content.src = data.src;
      content.style.width = '100%';
      content.style.height = '100%';
      content.style.objectFit = 'contain';
      content.style.pointerEvents = 'none';
      content.draggable = false;
    } else if (type === 'emoji') {
      content = document.createElement('span');
      content.textContent = data.content;
      content.style.display = 'block';
      content.style.textAlign = 'center';
      content.style.lineHeight = '1';
      content.style.color = '#fff';
      content.style.fontSize = '100px';
      content.style.pointerEvents = 'none';
    } else if (type === 'text') {
      content = document.createElement('div');
      content.textContent = data.text;
      content.contentEditable = true;
      content.style.width = '100%';
      content.style.height = '100%';
      content.style.fontSize = '48px';
      content.style.color = '#fff';
      content.style.fontFamily = 'Impact, sans-serif';
      content.style.textTransform = 'uppercase';
      content.style.textAlign = 'center';
      content.style.display = 'flex';
      content.style.alignItems = 'center';
      content.style.justifyContent = 'center';
      content.style.wordBreak = 'break-word';
      content.style.textShadow = '2px 2px 4px #000, -2px -2px 4px #000';
      content.style.fontWeight = 'bold';
      content.style.outline = 'none';
      
      content.addEventListener('mousedown', (e) => {
        e.stopPropagation();
      });
    }

    if (content) wrapper.appendChild(content);
    return wrapper;
  }

  // ==================== DRAGGING ====================
  
  function makeDraggable(el) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;

    el.addEventListener('mousedown', dragMouseDown);
    el.addEventListener('touchstart', dragTouchStart, { passive: false });

    function dragMouseDown(e) {
      if (e.target.contentEditable === 'true') return;
      if (e.button !== 0) return;
      
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      isDragging = true;
      
      document.addEventListener('mousemove', elementDrag);
      document.addEventListener('mouseup', closeDragElement);
      
      selectElement(el);
    }

    function dragTouchStart(e) {
      if (e.target.contentEditable === 'true') return;
      
      e.preventDefault();
      const touch = e.touches[0];
      pos3 = touch.clientX;
      pos4 = touch.clientY;
      isDragging = true;
      
      document.addEventListener('touchmove', elementDragTouch, { passive: false });
      document.addEventListener('touchend', closeDragElement);
      
      selectElement(el);
    }

    function elementDrag(e) {
      if (!isDragging) return;
      e.preventDefault();
      
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      
      el.style.top = (el.offsetTop - pos2) + "px";
      el.style.left = (el.offsetLeft - pos1) + "px";
    }

    function elementDragTouch(e) {
      if (!isDragging) return;
      e.preventDefault();
      
      const touch = e.touches[0];
      pos1 = pos3 - touch.clientX;
      pos2 = pos4 - touch.clientY;
      pos3 = touch.clientX;
      pos4 = touch.clientY;
      
      el.style.top = (el.offsetTop - pos2) + "px";
      el.style.left = (el.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
      isDragging = false;
      document.removeEventListener('mousemove', elementDrag);
      document.removeEventListener('mouseup', closeDragElement);
      document.removeEventListener('touchmove', elementDragTouch);
      document.removeEventListener('touchend', closeDragElement);
    }
  }

  // ==================== RESIZING ====================
  
  function makeResizable(el) {
    el.style.resize = 'both';
    el.style.overflow = 'hidden';
    el.style.minWidth = '80px';
    el.style.minHeight = '60px';
  }

  // ==================== ROTATION ====================
  
  function makeRotatable(el) {
    el._rotation = 0;
    
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 5 : -5;
      el._rotation += e.shiftKey ? delta * 0.2 : delta;
      el.style.transform = `rotate(${el._rotation}deg)`;
    }, { passive: false });

    let touchRotateStart = null;
    
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        touchRotateStart = Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX);
      }
    });

    el.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && touchRotateStart !== null) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const angle = Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX);
        const delta = (angle - touchRotateStart) * (180 / Math.PI);
        el._rotation += delta;
        el.style.transform = `rotate(${el._rotation}deg)`;
        touchRotateStart = angle;
      }
    }, { passive: false });

    el.addEventListener('touchend', () => {
      touchRotateStart = null;
    });
  }

  // ==================== DELETE BUTTON ====================
  
  function addDeleteBtn(wrapper) {
    const del = document.createElement('button');
    del.textContent = '×';
    del.className = 'delete-btn';
    del.onclick = (e) => {
      e.stopPropagation();
      wrapper.remove();
      if (selectedElement === wrapper) {
        selectedElement = null;
      }
    };
    wrapper.appendChild(del);
  }

  // ==================== SELECTION ====================
  
  function addSelectHandler(wrapper) {
    wrapper.addEventListener('mousedown', (e) => {
      if (e.button === 0 && e.target.contentEditable !== 'true') {
        selectElement(wrapper);
      }
    });

    wrapper.addEventListener('touchstart', () => {
      selectElement(wrapper);
    });
  }

  function selectElement(el) {
    if (selectedElement) {
      selectedElement.classList.remove('selected');
    }
    selectedElement = el;
    el.classList.add('selected');
  }

  // ==================== DOWNLOAD ====================
  
  function downloadMeme() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const w = canvasContainer.clientWidth;
    const h = canvasContainer.clientHeight;
    
    canvas.width = w * 2; // Higher resolution
    canvas.height = h * 2;
    ctx.scale(2, 2);

    const bgImg = document.getElementById('bgImage');
    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, w, h);
    } else {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, w, h);
    }

    const elements = Array.from(canvasContainer.querySelectorAll('.meme-element'));
    
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const containerRect = canvasContainer.getBoundingClientRect();
      const x = rect.left - containerRect.left;
      const y = rect.top - containerRect.top;
      const ew = rect.width;
      const eh = rect.height;

      ctx.save();
      ctx.translate(x + ew/2, y + eh/2);
      ctx.rotate((el._rotation || 0) * Math.PI / 180);
      ctx.translate(-ew/2, -eh/2);

      const child = el.firstChild;
      
      if (child.tagName === 'IMG') {
        ctx.drawImage(child, 0, 0, ew, eh);
      } else if (child.tagName === 'SPAN' || child.tagName === 'DIV') {
        const text = child.textContent;
        const fs = parseFloat(child.style.fontSize) || 40;
        
        ctx.font = `bold ${fs}px ${child.style.fontFamily || 'Impact, sans-serif'}`;
        ctx.fillStyle = child.style.color || '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.strokeText(text, ew/2, eh/2);
        ctx.fillText(text, ew/2, eh/2);
      }
      
      ctx.restore();
    });

    const link = document.createElement('a');
    link.download = `hearing-meme-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    showToast('Meme downloaded! 🎉');
  }
});
