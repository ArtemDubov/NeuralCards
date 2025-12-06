import React from "react";
import {
  useToggleFavoriteSet,
  useToggleFavoriteCard,
} from "../../../../api/favorites";
import StarIcon from "../../../shared/components/StarIcon";
import { useAppStore } from "../../../../shared/stores/appStore";

const FavoriteButton = ({ itemId, itemType = "cardset" }) => {
  const { t } = useAppStore();

  const toggleFavoriteSet = useToggleFavoriteSet();
  const toggleFavoriteCard = useToggleFavoriteCard();

  const toggleMutation =
    itemType === "cardset" ? toggleFavoriteSet : toggleFavoriteCard;

  const handleToggle = async () => {
    try {
      await toggleMutation.mutateAsync(itemId);
    } catch (error) {
      console.error("Ошибка обновления избранного:", error);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="nt-btn nt-btn--favorite"
      title={t("favorites.toggle")}
      disabled={toggleMutation.isPending}
    >
      <StarIcon filled={false} />
      {toggleMutation.isPending && "..."}
    </button>
  );
};

export default FavoriteButton;
