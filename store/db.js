// store/db.js
import * as SQLite from "expo-sqlite";
export const db = SQLite.openDatabase("pos.db");
