import { Text, View } from "react-native";

/**
 * Shared bulleted list primitives: `List` containers with real list semantics
 * (`role="list"`) and `ListItem` rows with a marker column, hanging indent,
 * and optional nested lists. Markers align with the item's first text line;
 * nested lists indent under the parent label.
 * @module components/list
 */

/**
 * Props for {@link List}.
 *
 * @typedef {object} ListProps
 * @property {import("react").ReactNode} [children] `ListItem` elements (or other nodes rendered as list content).
 * @property {boolean} [inset] Indent the whole list one level (for nesting under a parent item) and tighten row spacing.
 * @property {string} [className] Extra Tailwind classes merged onto the container (e.g. spacing against neighbors).
 */

/**
 * Bulleted list container.
 *
 * @param {ListProps} props - Component props.
 * @returns {JSX.Element} A `role="list"` column of items.
 */
function List({ children, inset = false, className = "" }) {
  return (
    <View
      role="list"
      className={`flex-col ${inset ? "ml-5 mt-1 gap-1" : "gap-2"} ${className}`}
    >
      {children}
    </View>
  );
}

/**
 * Props for {@link ListItem}.
 *
 * @typedef {object} ListItemProps
 * @property {string} label Item text.
 * @property {import("react").ReactNode} [children] Nested {@link List} rendered under the label.
 * @property {string} [marker] Bullet glyph ("•" disc by default; "–" reads as a sub-item marker).
 * @property {string} [markerClass] Tailwind classes for the marker glyph (defaults to the light ink tone).
 * @property {string} [textClass] Tailwind classes for the label (defaults to muted white).
 */

/**
 * Single list row: marker column + label with a hanging indent, plus an
 * optional nested list aligned under the label.
 *
 * @param {ListItemProps} props - Component props.
 * @returns {JSX.Element} A `role="listitem"` row.
 */
function ListItem({ label, children, marker = "•", markerClass = "text-[#C9CCDD]", textClass = "text-white/60" }) {
  return (
    <View role="listitem">
      <View className="flex-row gap-2">
        <Text className={`w-3 shrink-0 font-outfit text-[10px] md:text-xs leading-snug ${markerClass}`}>{marker}</Text>
        <Text className={`flex-1 font-outfit text-[10px] md:text-xs leading-snug ${textClass}`}>{label}</Text>
      </View>
      {children ? (
        <View className="mt-1">
          {children}
        </View>
      ) : null}
    </View>
  );
}

export { List, ListItem };
