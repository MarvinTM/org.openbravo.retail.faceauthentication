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
            });
          });
        })
        .catch(error => OB.error('Error on start video ' + error));
      // this._initializeReaderWhenDOMIsAvailable();
    }
  });
})();
