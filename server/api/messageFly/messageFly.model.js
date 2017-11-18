'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (sequelize, DataTypes) {
  var MessageFly = sequelize.define('MessageFly', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    text: DataTypes.STRING,
    groupIds: DataTypes.STRING,
    numbers: DataTypes.STRING,
    total: { type: DataTypes.INTEGER, defaultValue: 0 },
    success: { type: DataTypes.INTEGER, defaultValue: 0 },
    fail: { type: DataTypes.INTEGER, defaultValue: 0 },
    cutting: { type: DataTypes.INTEGER, defaultValue: 0 },
    unicode: DataTypes.BOOLEAN,
    flash: DataTypes.BOOLEAN,
    scheduledOn: DataTypes.DATE,
    send: DataTypes.BOOLEAN
  }, {
    tableName: 'message_fly',
    timestamps: true,
    paranoid: true,
    classMethods: {
      associate: function associate(db) {
        MessageFly.belongsTo(db.User, {
          foreignKey: 'userId',
          allowNull: false
        });
        MessageFly.belongsTo(db.Route, {
          foreignKey: 'routeId',
          allowNull: false
        });
        MessageFly.belongsTo(db.SenderId, {
          foreignKey: 'senderId'
        });
        MessageFly.belongsTo(db.Campaign, {
          foreignKey: 'campaignId'
        });
      }
    }
  });

  return MessageFly;
};
//# sourceMappingURL=messageFly.model.js.map
