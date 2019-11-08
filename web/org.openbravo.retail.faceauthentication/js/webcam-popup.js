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
    style: 'width: 640px; height: 480px;',
    components: [
      {
        tag: 'video',
        name: 'videoElement'
      }
    ]
  });

  enyo.kind({
    name: 'OB.UI.FA.WebCam.Modal',
    kind: 'OB.UI.ModalAction',
    i18nHeader: 'FA_ScanFromWebcam',
    bodyContent: {
      style: 'width: 640px; height: 480px;',
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
          }
        }
      ]
    },
    executeOnHide: function() {
      this.stream.getTracks()[0].stop();
      this.destroyComponents();
    },
    executeOnShow: function() {
      this.inherited(arguments);
      this.video = null;
      this.stream = null;

      const detectFace = new Promise((resolve, reject) => {
        let interval = setInterval(async () => {
          if (this.video === null) {
            return;
          }
          const detection = await faceapi.detectSingleFace(
            this.video,
            new faceapi.TinyFaceDetectorOptions()
          );
          if (detection) {
            var hiddenCanvas = faceapi.createCanvasFromMedia(this.video);
            let finalImage = hiddenCanvas.toDataURL('image/jpeg');
            clearInterval(interval);
            resolve(finalImage);
          }
        }, 1000);
      });

      navigator.mediaDevices
        .getUserMedia({ video: { width: 640, height: 480 } })
        .then(stream => {
          this.stream = stream;
          this.video = document.getElementById(
            this.$.bodyContent.$.webcam.$.videoElement.id
          );

          this.video.autoplay = true;
          this.video.srcObject = stream;
          this.video.addEventListener('play', () => {
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
    }
  });
})();
