import { getCountryMetadata } from "../../data/geometry/world";
import { useAppStore } from "../../store/appStore";

function getCountryLabel(countryCode: string | null) {
  if (!countryCode) {
    return null;
  }

  return getCountryMetadata(countryCode)?.name ?? countryCode;
}

export function SidePanel() {
  const hoveredCountryCode = useAppStore((state) => state.hoveredCountryCode);
  const selectedCountryCode = useAppStore((state) => state.selectedCountryCode);
  const hoveredCountryLabel = getCountryLabel(hoveredCountryCode);
  const selectedCountryLabel = getCountryLabel(selectedCountryCode);

  return (
    <aside className="side-panel" role="complementary">
      <p className="panel-heading">COUNTRY MONITOR</p>
      <p className="panel-copy">
        {hoveredCountryLabel
          ? `Hover target: ${hoveredCountryLabel}`
          : "Hover a country to inspect details"}
      </p>
      <p className="panel-copy">
        {selectedCountryLabel ? `Selected: ${selectedCountryLabel}` : "No locked selection"}
      </p>
    </aside>
  );
}
