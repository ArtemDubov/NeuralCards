import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "../../../utils/icons";
import { motion } from "framer-motion";

/**
 * Empty Chat State Component
 * Displays when no chat is selected
 */
const EmptyChatState = React.memo(function EmptyChatState({ primary, text, txtMuted }) {
  return (
    <div className="chat-empty-state" style={{ 
      flex: 1, 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      gap: 20,
      padding: 40,
      textAlign: "center",
    }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ 
          width: 100, 
          height: 100, 
          borderRadius: "50%", 
          background: `linear-gradient(135deg, ${primary}20, ${primary}40)`, 
          color: primary, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          fontSize: 40,
          boxShadow: `0 8px 24px ${primary}30`,
        }}
      >
        <FontAwesomeIcon icon={faComments} />
      </motion.div>
      <div>
        <h3 className="chat-empty-title" style={{ 
          color: text, 
          fontSize: 22, 
          fontWeight: 700, 
          margin: "0 0 8px" 
        }}>
          Начните общение
        </h3>
        <p className="chat-empty-description" style={{ 
          color: txtMuted, 
          maxWidth: 320, 
          lineHeight: 1.6, 
          margin: 0 
        }}>
          Выберите собеседника из списка слева или найдите новых друзей через поиск
        </p>
      </div>
    </div>
  );
});

export default EmptyChatState;
