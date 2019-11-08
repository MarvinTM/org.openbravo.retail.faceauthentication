/*
 ************************************************************************************
 * Copyright (C) 2019 Openbravo S.L.U.
 * Licensed under the Openbravo Commercial License version 1.0
 * You may obtain a copy of the License at http://www.openbravo.com/legal/obcl.html
 * or in the legal folder of this module distribution.
 ************************************************************************************
 */

/*global OB,enyo, faceapi*/

(function() {
  enyo.kind({
    name: 'OB.UI.FA.Webcam',
    classes: '',
    components: [
      // {
      //   tag: 'canvas',
      //   name: 'overlay'
      //   // style: ' zIndex: 2, position: "absolute", top: 0, left: 0 '
      // },
      {
        tag: 'video',
        name: 'videoElement'
        // style: ' zIndex: 1, position: "absolute", top: 0, left: 0 '
      }
    ]
  });

  enyo.kind({
    name: 'OB.UI.FA.WebCam.Modal',
    kind: 'OB.UI.ModalAction',
    i18nHeader: 'FA_ScanFromWebcam',
    bodyContent: {
      components: [
        {
          kind: 'OB.UI.FA.Webcam'
        }
      ]
    },
    bodyButtons: {
      components: [
        {
          kind: 'OB.UI.ModalDialogButton',
          i18nContent: 'OBPOS_Cancel',
          tap: function() {
            this.doHideThisPopup();
            // OB.OBCBS.BarcodeReader.shutdown();
          }
        }
      ]
    },
    executeOnHide: function() {
      // OB.OBCBS.BarcodeReader.shutdown();
    },
    executeOnShow: function() {
      this.inherited(arguments);
      this.video = null;
      var me = this;

      const detectFace = new Promise((resolve, reject) => {
        let interval = setInterval(async () => {
          if (me.video === null) {
            return;
          }
          const detection = await faceapi.detectSingleFace(
            me.video,
            new faceapi.TinyFaceDetectorOptions()
          );
          if (detection) {
            var hiddenCanvas = faceapi.createCanvasFromMedia(me.video);
            let finalImage = hiddenCanvas.toDataURL('image/jpeg');
            clearInterval(interval);
            resolve(finalImage);
          }
        }, 1000);
      });

      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(function(stream) {
          me.video = document.getElementById(
            'terminal_confirmationContainer_modalFaceAuthentication_body_webcam_videoElement'
          );
          me.video.autoplay = true;
          me.video.srcObject = stream;
          me.video.addEventListener('play', () => {
            detectFace.then(value => {
              OB.info(value);
              let params;
              params =
                JSON.parse(
                  JSON.stringify(OB.MobileApp.model.get('loginUtilsParams'))
                ) || {};
              params.image = value;
              params.user = 'dummy';
              params.Command = 'DEFAULT';
              params.IsAjaxCall = 1;
              params.appName = OB.MobileApp.model.get('appName');
              var rr,
                ajaxRequest = new enyo.Ajax({
                  url: OB.MobileApp.model.get('loginHandlerUrl'),
                  cacheBust: false,
                  method: 'POST',
                  timeout: 15000,
                  // don't do retries as this gives side effects as re-showing login page
                  maxNumOfRequestRetries: 0,
                  contentType:
                    'application/x-www-form-urlencoded; charset=UTF-8',
                  data: params,
                  success: (inSender, inResponse) => {
                    if (inResponse && inResponse.showMessage) {
                      OB.error('no se quien eres');
                    } else {
                      OB.info('bienvenido: ' + inResponse.userId);

                      //                      window.location.reload();
                    }
                  },
                  fail: () => window.location.reload()
                });
              rr = new OB.RR.Request({
                ajaxRequest: ajaxRequest
              });
              rr.exec(OB.MobileApp.model.get('loginHandlerUrl'));
            });
          });
        })
        .catch(error => OB.error('Error on start video ' + error));
      // this._initializeReaderWhenDOMIsAvailable();
    }
  });
})();
