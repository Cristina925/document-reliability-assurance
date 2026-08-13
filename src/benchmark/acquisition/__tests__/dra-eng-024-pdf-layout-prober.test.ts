/**
 * DRA-ENG-024 — unit tests for parseBboxLayoutXml against fixture XML,
 * independent of shelling out to pdftotext.
 */

import { describe, it, expect } from "vitest";
import { parseBboxLayoutXml } from "../pdf-layout-prober.js";

const SAMPLE_XML = `<!DOCTYPE html>
<html><head><title></title></head>
<body>
<doc>
  <page width="612.000000" height="792.000000">
    <flow>
      <block xMin="45.000000" yMin="60.000000" xMax="210.000000" yMax="70.000000">
        <line xMin="45.000000" yMin="60.000000" xMax="210.000000" yMax="70.000000">
          <word xMin="45.000000" yMin="60.000000" xMax="80.000000" yMax="70.000000">Left</word>
          <word xMin="85.000000" yMin="60.000000" xMax="120.000000" yMax="70.000000">column</word>
        </line>
      </block>
    </flow>
    <flow>
      <block xMin="222.000000" yMin="60.000000" xMax="389.000000" yMax="70.000000">
        <line xMin="222.000000" yMin="60.000000" xMax="389.000000" yMax="70.000000">
          <word xMin="222.000000" yMin="60.000000" xMax="260.000000" yMax="70.000000">Right</word>
          <word xMin="265.000000" yMin="60.000000" xMax="300.000000" yMax="70.000000">column</word>
        </line>
      </block>
    </flow>
    <flow>
      <block xMin="45.000000" yMin="700.000000" xMax="80.000000" yMax="710.000000">
        <line xMin="45.000000" yMin="700.000000" xMax="80.000000" yMax="710.000000">
          <word xMin="45.000000" yMin="700.000000" xMax="80.000000" yMax="710.000000">Tom &amp; Jerry &lt;3&gt;</word>
        </line>
      </block>
    </flow>
  </page>
  <page width="612.000000" height="792.000000">
    <flow>
      <block xMin="45.000000" yMin="50.000000" xMax="500.000000" yMax="60.000000">
        <line xMin="45.000000" yMin="50.000000" xMax="500.000000" yMax="60.000000">
          <word xMin="45.000000" yMin="50.000000" xMax="90.000000" yMax="60.000000">Second</word>
          <word xMin="95.000000" yMin="50.000000" xMax="130.000000" yMax="60.000000">page</word>
        </line>
      </block>
    </flow>
  </page>
</doc>
</body></html>`;

describe("DRA-ENG-024 — parseBboxLayoutXml fixture parsing", () => {
  it("parses page count, dimensions, block count, and bbox coordinates", () => {
    const pages = parseBboxLayoutXml(SAMPLE_XML);
    expect(pages).toHaveLength(2);

    const p1 = pages[0];
    expect(p1.pageNumber).toBe(1);
    expect(p1.pageWidth).toBe(612);
    expect(p1.pageHeight).toBe(792);
    expect(p1.blocks).toHaveLength(3);

    expect(p1.blocks[0]).toEqual({
      xMin: 45,
      yMin: 60,
      xMax: 210,
      yMax: 70,
      text: "Left column",
    });
    expect(p1.blocks[1].text).toBe("Right column");

    const p2 = pages[1];
    expect(p2.pageNumber).toBe(2);
    expect(p2.blocks).toHaveLength(1);
    expect(p2.blocks[0].text).toBe("Second page");
  });

  it("decodes XML entities within word text", () => {
    const pages = parseBboxLayoutXml(SAMPLE_XML);
    expect(pages[0].blocks[2].text).toBe("Tom & Jerry <3>");
  });

  it("returns an empty array for XML with no <page> elements", () => {
    expect(parseBboxLayoutXml("<html><body>no pages here</body></html>")).toEqual([]);
  });

  it("skips blocks whose words are all empty/whitespace", () => {
    const xml = `<page width="100.000000" height="100.000000">
      <block xMin="1.000000" yMin="1.000000" xMax="2.000000" yMax="2.000000">
        <line xMin="1.000000" yMin="1.000000" xMax="2.000000" yMax="2.000000">
          <word xMin="1.000000" yMin="1.000000" xMax="2.000000" yMax="2.000000"></word>
        </line>
      </block>
    </page>`;
    const pages = parseBboxLayoutXml(xml);
    expect(pages[0].blocks).toHaveLength(0);
  });
});
