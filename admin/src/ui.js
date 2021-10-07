import {Notify, Dialog, Loading} from 'quasar'

export default {
  notify(message) {
    Notify.create(message)
  },

  notifyUnexpectedError() {
    Notify.create({
      color: 'red-4',
      icon: 'error',
      message: 'Sorry, Unexpected Error Occurred.'
    });
  },

  notifyException(e) {
    let message = e.toString();
    if (e.response?.data) {
      message = e.response.data.error.description
    }
    Notify.create({
      color: 'red-4',
      icon: 'error',
      message
    });
  },

  notifyError(message) {
    Notify.create({
      color: 'red-4',
      icon: 'error',
      message: message
    });
  },

  notifySuccess(message) {
    Notify.create({
      color: 'green-4',
      icon: 'done',
      message: message
    });
  },

  confirm(message, title = '') {
    let obj = {
      message: message,
      ok: { label: 'yes', flat: true, unelevated: true},
      cancel: { label: 'no', flat: true, unelevated: true}
    };

    if (title) obj.title = title;

    return new Promise(((resolve, reject) => {
      this.audio.play('alert');
      Dialog.create(obj)
        .onOk(() => resolve())
        .onCancel(() => reject())
        .onDismiss(() => reject())
    }));
  },

  askYesNo(message, title = '', onOk = null) {
    let obj = {
      title: title,
      message: message,
      ok: { label: 'yes', flat: true, unelevated: true },
      cancel: { label: 'no', flat: true, unelevated: true }
    };

    return new Promise(((resolve, reject) => {
      this.audio.play('alert');
      Dialog.create(obj)
        .onOk(() => resolve())
        .onCancel(() => reject())
        .onDismiss(() => reject())
    }));
  },

  showLoader(message) {
    Loading.show({
      message: message
    })
  },

  hideLoader() {
    Loading.hide();
  }
}

