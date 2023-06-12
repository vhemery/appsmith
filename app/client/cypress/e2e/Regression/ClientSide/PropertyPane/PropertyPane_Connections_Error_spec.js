const dsl = require("../../../../fixtures/TextTabledsl.json");
import { entityExplorer } from "../../../../support/Objects/ObjectsCore";

describe("Property pane connections error state", function () {
  before(() => {
    cy.addDsl(dsl);
  });

  it("1. Check if the connection shows an error state when a connection has an error", function () {
    entityExplorer.SelectEntityByName("Table1", "Container3");
    cy.testJsontext("tabledata", "{{error}}");
    entityExplorer.SelectEntityByName("Text4", "Container1");
    cy.testJsontext("text", "{{Table1.searchText}}");
    // Find class which indicates an error
    cy.get(".t--connection-error");
  });
});
