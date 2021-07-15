import loki from "lokijs";
import { Items, Carts } from "../models/models";

const lokiDB = new loki("octopus_db.json", {
    autosave: true,
    autosaveInterval: 100,
    autoload: true,
    persistenceMethod: 'localStorage'
});

const items = lokiDB.addCollection<Items>("items", { autoupdate: true, disableMeta: true });
const carts = lokiDB.addCollection<Carts>("carts", { autoupdate: true, disableMeta: true });

export { lokiDB, items, carts };