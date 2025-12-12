import React, { useState, useRef } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useAppStore } from "../../../shared/stores/appStore";

const ImageCropper = ({ imageSrc, onCropComplete, onCancel }) => {
  const { t } = useAppStore();
  const [crop, setCrop] = useState({
    unit: "px",
    width: 200,
    height: 200,
    x: 0,
    y: 0,
    aspect: 1 / 1,
  });
  const [image, setImage] = useState(null);
  const imgRef = useRef(null);

  const handleImageLoad = (img) => {
    setImage(img);
    // Автоматически выбираем центр изображения
    const minDimension = Math.min(img.width, img.height);
    const x = (img.width - minDimension) / 2;
    const y = (img.height - minDimension) / 2;

    setCrop((prev) => ({
      ...prev,
      width: minDimension,
      height: minDimension,
      x,
      y,
    }));
  };

  const handleCropComplete = () => {
    if (imgRef.current && crop.width && crop.height && image) {
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const cropData = {
        x: crop.x * scaleX,
        y: crop.y * scaleY,
        width: crop.width * scaleX,
        height: crop.height * scaleY,
        scale: scaleX,
      };

      onCropComplete(cropData);
    }
  };

  return (
    <div className="nt-image-cropper">
      <div className="nt-cropper__header">
        <h3>{t("profile.avatar.crop_title")}</h3>
        <p>{t("profile.avatar.crop_hint")}</p>
      </div>

      <div className="nt-cropper__preview">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          aspect={1}
          minWidth={100}
          minHeight={100}
          circularCrop={false}
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Обрезка"
            onLoad={(e) => handleImageLoad(e.currentTarget)}
            style={{ maxWidth: "100%", maxHeight: "400px" }}
          />
        </ReactCrop>
      </div>

      <div className="nt-cropper__controls">
        <button className="nt-btn nt-btn--outline" onClick={onCancel}>
          {t("common.cancel")}
        </button>
        <button className="nt-btn nt-btn--primary" onClick={handleCropComplete}>
          {t("profile.avatar.crop_save")}
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;
