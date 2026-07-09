import { Clapperboard, Database, FileText, Image as ImageIcon, Search } from "lucide-react";

/**
 * A CSS-built concept preview of the Cloud workspace — labeled as a concept,
 * never passed off as a screenshot. Content mirrors the real demo universes
 * (Plotline, Enamel IT) so the mock is honest about what syncs.
 */
export function CloudAppMock() {
  return (
    <figure className="ut-appmock">
      <div aria-hidden="true" className="ut-appmock-frame">
        <div className="ut-appmock-bar">
          <span />
          <span />
          <span />
          <em>cloud.pmm-os.com — concept</em>
        </div>
        <div className="ut-appmock-body">
          <aside>
            <strong>Engagements</strong>
            <div className="ut-appmock-item is-active">
              <Database size={13} />
              <div>
                <b>Plotline</b>
                <small>analytics · 89 records</small>
              </div>
            </div>
            <div className="ut-appmock-item">
              <Database size={13} />
              <div>
                <b>Enamel IT</b>
                <small>services · 54 records</small>
              </div>
            </div>
          </aside>
          <div className="ut-appmock-main">
            <div className="ut-appmock-row">
              <span className="ut-appmock-chip">
                <FileText size={12} /> Launch kit · shared
              </span>
              <span className="ut-appmock-chip">
                <Search size={12} /> Evidence · 89 cited
              </span>
            </div>
            <div className="ut-appmock-assets">
              <div className="ut-appmock-asset">
                <ImageIcon size={16} />
                <span>Hero image · v3</span>
              </div>
              <div className="ut-appmock-asset">
                <ImageIcon size={16} />
                <span>Proof card · 4 formats</span>
              </div>
              <div className="ut-appmock-asset is-video">
                <Clapperboard size={16} />
                <span>Launch film · 15s draft</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <figcaption>Concept preview — the shipped product will earn its own screenshots.</figcaption>
    </figure>
  );
}
