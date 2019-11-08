/*
 ************************************************************************************
 * Copyright (C) 2019 Openbravo S.L.U.
 * Licensed under the Openbravo Commercial License version 1.0
 * You may obtain a copy of the License at http://www.openbravo.com/legal/obcl.html
 * or in the legal folder of this module distribution.
 ************************************************************************************
 */

/*global OB, enyo, faceapi*/

enyo.kind({
  name: 'OB.OBPOSLogin.UI.Login.faceAuthenticationButton',
  kind: 'OB.UI.ModalDialogButton',
  i18nLabel: 'FA_FaceAuthenticationLbl',
  tap: function() {
    var me = this;
    let models = '../org.openbravo.retail.faceauthentication/res/models';
    let startPopup = () => {
      this.dialog = OB.MobileApp.view.$.confirmationContainer.createComponent({
        kind: 'OB.UI.FA.WebCam.Modal',
        name: 'modalFaceAuthentication',
        context: this
      });
      this.dialog.show();
    };
    Promise.all([
      faceapi.loadTinyFaceDetectorModel(models),
      faceapi.nets.ssdMobilenetv1.loadFromUri(models)
    ])
      .then(() => startPopup())
      .catch(() => OB.error('Not able to load faceapi models'));
  },
  init: function(model) {
    this.model = model;
  }
});

// Push the new created button to buttons array at first position
OB.OBPOSLogin.UI.Login.prototype.buttons.splice(0, 0, {
  kind: 'OB.OBPOSLogin.UI.Login.faceAuthenticationButton',
  name: 'faceAuthenticationButton'
});
