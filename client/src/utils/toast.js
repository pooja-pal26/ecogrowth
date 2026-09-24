import Swal from 'sweetalert2';

// Creative Floating Toast matching EcoGrowth Theme
export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 4000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
  customClass: {
    container: 'swal2-toast-container',
    popup: 'colored-toast shadow-2xl rounded-2xl font-sans text-sm border border-slate-100',
    title: 'text-sm font-bold text-slate-800'
  }
});

// Toast notification shortcuts
export const showSuccessToast = (message, title = 'Success') => {
  return Toast.fire({
    icon: 'success',
    title: `<span class="font-bold text-slate-900">${title}</span>`,
    html: `<div class="text-xs text-slate-600 mt-0.5">${message}</div>`,
    iconColor: '#10b981',
    background: '#ffffff',
    color: '#0f172a'
  });
};

export const showErrorToast = (message, title = 'Error') => {
  return Toast.fire({
    icon: 'error',
    title: `<span class="font-bold text-rose-900">${title}</span>`,
    html: `<div class="text-xs text-slate-600 mt-0.5">${message}</div>`,
    iconColor: '#ef4444',
    background: '#ffffff',
    color: '#0f172a'
  });
};

export const showWarningToast = (message, title = 'Warning') => {
  return Toast.fire({
    icon: 'warning',
    title: `<span class="font-bold text-amber-900">${title}</span>`,
    html: `<div class="text-xs text-slate-600 mt-0.5">${message}</div>`,
    iconColor: '#f59e0b',
    background: '#ffffff',
    color: '#0f172a'
  });
};

export const showInfoToast = (message, title = 'Notice') => {
  return Toast.fire({
    icon: 'info',
    title: `<span class="font-bold text-sky-900">${title}</span>`,
    html: `<div class="text-xs text-slate-600 mt-0.5">${message}</div>`,
    iconColor: '#0284c7',
    background: '#ffffff',
    color: '#0f172a'
  });
};

// Creative Deletion Confirmation Dialog matching EcoGrowth theme
export const confirmDeleteDialog = async ({
  title = 'Delete Record?',
  text = 'Are you sure you want to delete this record? This action cannot be undone.',
  confirmButtonText = 'Yes, Delete',
  cancelButtonText = 'Cancel'
} = {}) => {
  return Swal.fire({
    title: `<span class="text-xl font-black text-slate-900">${title}</span>`,
    html: `<p class="text-sm text-slate-600 mt-1">${text}</p>`,
    icon: 'warning',
    iconColor: '#ef4444',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: 'rounded-2xl shadow-2xl p-6 font-sans border border-slate-200',
      confirmButton: 'px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer',
      cancelButton: 'px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all cursor-pointer'
    }
  });
};

// Global Alert Replacement for all legacy alert() calls across the application
export const setupGlobalAlerts = () => {
  if (typeof window !== 'undefined') {
    window.alert = (message) => {
      const msg = String(message || '');
      const lower = msg.toLowerCase();
      if (
        lower.includes('success') ||
        lower.includes('added') ||
        lower.includes('saved') ||
        lower.includes('updated') ||
        lower.includes('completed') ||
        lower.includes('allocated successfully')
      ) {
        showSuccessToast(msg, 'Success');
      } else if (
        lower.includes('error') ||
        lower.includes('failed') ||
        lower.includes('cannot') ||
        lower.includes('server')
      ) {
        showErrorToast(msg, 'Error');
      } else if (
        lower.includes('missing') ||
        lower.includes('required') ||
        lower.includes('please') ||
        lower.includes('select') ||
        lower.includes('enter') ||
        lower.includes('mandatory')
      ) {
        showWarningToast(msg, 'Validation Required');
      } else {
        showInfoToast(msg, 'Notification');
      }
    };
  }
};

export default Swal;
