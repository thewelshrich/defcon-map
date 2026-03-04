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

  const activeCode = selectedCountryCode ?? hoveredCountryCode;
  const activeLabel = getCountryLabel(activeCode);
  const isSelected = selectedCountryCode !== null;

  return (
    <aside className="side-panel" role="complementary">
      <p className="panel-heading">COUNTRY MONITOR</p>
      {activeLabel ? (
        <>
          <p className="panel-country-name">{activeLabel}</p>
          <hr className="panel-divider" />
          <p className="panel-copy">
            {isSelected ? "LOCKED" : "TRACKING"}
          </p>
        </>
      ) : (
        <p className="panel-standby">STANDBY</p>
      )}
    </aside>
  );
}
