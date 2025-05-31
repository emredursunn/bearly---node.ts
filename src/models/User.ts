import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { v4 as uuidv4 } from 'uuid';

interface UserAttributes {
  id: string;
  email: string;
  password: string;
  coin: number;
  languages: object;
}

interface UserCreationAttributes {
  email: string;
  password: string;
}

class User extends Model<UserAttributes, UserCreationAttributes> {
  public id!: string;
  public email!: string;
  public password!: string;
  public coin!: number;
  public languages!: object;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    coin: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    languages: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
  }
);

export default User;
