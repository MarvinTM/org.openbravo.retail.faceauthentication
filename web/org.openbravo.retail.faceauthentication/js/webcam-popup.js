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
            });
          });
        })
        .catch(error => OB.error('Error on start video ' + error));
    }
  });
})();
