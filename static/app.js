(function(){
  const fileInput = document.getElementById('file-input');
  const dropzone = document.getElementById('dropzone');
  const browseBtn = document.getElementById('browse-btn');
  const preview = document.getElementById('preview');
  const predictBtn = document.getElementById('predict-btn');
  const resultEl = document.getElementById('result');

  let currentFile = null;

  function resetResult(){
    resultEl.classList.add('hidden');
    resultEl.innerHTML = '';
  }

  function showPreview(file){
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }

  function enablePredict(enabled){
    predictBtn.disabled = !enabled;
  }

  browseBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    resetResult();
    const file = fileInput.files[0];
    if(!file) return;
    currentFile = file;
    showPreview(file);
    enablePredict(true);
  });

  ;['dragenter','dragover'].forEach(ev => {
    dropzone.addEventListener(ev, (e) => { e.preventDefault(); e.stopPropagation(); dropzone.classList.add('dragover'); });
  });
  ;['dragleave','drop'].forEach(ev => {
    dropzone.addEventListener(ev, (e) => { e.preventDefault(); e.stopPropagation(); dropzone.classList.remove('dragover'); });
  });
  dropzone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if(!file) return;
    currentFile = file;
    fileInput.files = e.dataTransfer.files;
    showPreview(file);
    enablePredict(true);
    resetResult();
  });

  async function predict(){
    if(!currentFile){ return; }
    enablePredict(false);
    resultEl.classList.remove('hidden');
    resultEl.innerHTML = '<span>Predicting…</span>';
    try{
      const form = new FormData();
      form.append('file', currentFile);
      const resp = await fetch('/predict', { method: 'POST', body: form });
      const data = await resp.json();
      if(data.error){ throw new Error(data.error); }
      const breed = data.predicted_class || 'Unknown';
      const conf = (data.confidence != null) ? (data.confidence * 100).toFixed(2) + '%' : '';
      resultEl.innerHTML = `<div class="breed">${breed}</div><div class="confidence">Confidence: ${conf}</div>`;
    }catch(err){
      resultEl.innerHTML = `<div style="color:#fca5a5;">${err.message || 'Prediction failed'}</div>`;
    }finally{
      enablePredict(true);
    }
  }

  predictBtn.addEventListener('click', predict);
})();


