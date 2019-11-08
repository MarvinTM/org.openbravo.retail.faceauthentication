/*
 ************************************************************************************
 * Copyright (C) 2019 Openbravo S.L.U.
 * Licensed under the Openbravo Commercial License version 1.0
 * You may obtain a copy of the License at http://www.openbravo.com/legal/obcl.html
 * or in the legal folder of this module distribution.
 ************************************************************************************
 */

/*global OB, enyo*/

enyo.kind({
  name: 'OB.OBPOSLogin.UI.Login.faceAuthenticationButton',
  kind: 'OB.UI.ModalDialogButton',
  i18nLabel: 'FA_FaceAuthenticationLbl',
  tap: function() {
    var me = this;
    //FIXME-SKIN: Username element structure has changed since the new POS Skin
    var loginuser = me.owner.$.formElementUsername
        ? me.owner.$.formElementUsername.coreElement.getValue()
        : me.owner.$.username.getValue(),
      connectedCallback = function() {
        OB.UTIL.showConfirmation.display(
          '',
          OB.I18N.getLabel('OBRETFP_PasswordRequestApproved')
        );
      },
      notConnectedCallback = function() {
        OB.UTIL.showError(
          OB.I18N.getLabel('OBPOS_OfflineWindowRequiresOnline')
        );
        return;
      };
    if (loginuser === '') {
      OB.UTIL.showError(OB.I18N.getLabel('OBRETFP_EmptyUser'));
      return;
    }
    OB.UTIL.Approval.requestApproval(
      me.model,
      'OBRETFP_approval.forgotPassword',
      function(approved, supervisor, approvalType) {
        if (approved && supervisor) {
          if (
            OB.MobileApp.model.get('connectedToERP') ||
            OB.UTIL.isNullOrUndefined(OB.MobileApp.model.get('connectedToERP'))
          ) {
            connectedCallback();
          } else {
            notConnectedCallback();
          }
        }
      },
      {
        loginuser: loginuser,
        terminal: OB.MobileApp.model.get('terminalName')
      }
    );
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
