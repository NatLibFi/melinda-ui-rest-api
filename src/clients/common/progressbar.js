//-----------------------------------------------------------------------------
// Functions for progress indicator bar
//-----------------------------------------------------------------------------

export function startProcess() {
    const progressbar = document.querySelector(`#progressbar`);
    progressbar.className = 'progress-bar';
  }
  
  export function stopProcess() {
    const progressbar = document.querySelector(`#progressbar`);
    progressbar.className = 'progress-bar-inactive';
  }
  