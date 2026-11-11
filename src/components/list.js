import { StyleSheet, Text, View } from "react-native";
import { unstable_createElement } from "react-native-web";

/**
 * Shared list primitives that render real semantic markup: `List` mounts a
 * `<ul>` and `ListItem` an `<li>`, so nested lists are genuine nested lists
 * in the DOM. This is a web-only project whose tree mounts through react-dom
 * (react-native-web renders via `createRoot`/`hydrateRoot`), which makes
 * standard HTML elements valid host elements; `unstable_createElement`
 * routes their props through the same DOM-prop/style pipeline as the core
 * components. Markers are rendered glyphs (not CSS list markers) so they
 * keep the app's font and colors.
 * @module components/list
 */

/**
 * Base layout for every `<ul>`: reset the user-agent list styles and lay
 * items out as a flex column.
 *
 * @type {import("react-native").ViewStyle}
 */
const listBase = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  listStyleType: "none",
  margin: 0,
  padding: 0
};

/**
 * Extra layout for nested (inset) lists: indent one level under the parent
 * label and tighten the spacing.
 *
 * @type {import("react-native").ViewStyle}
 */
const listInset = {
  gap: 4,
  marginLeft: 20,
  marginTop: 4
};

/**
 * Wraps a real `<ul>` DOM element, resolving props through the
 * react-native-web DOM-prop pipeline (style arrays, class passthrough).
 *
 * @param {object} props Props forwarded to the element.
 * @returns {JSX.Element} The `<ul>` element.
 */
function Ul(props) {
  return unstable_createElement("ul", props);
}

/**
 * Wraps a real `<li>` DOM element with the same prop pipeline as {@link Ul}.
 *
 * @param {object} props Props forwarded to the element.
 * @returns {JSX.Element} The `<li>` element.
 */
function Li(props) {
  return unstable_createElement("li", props);
}

/**
 * Props for {@link List}.
 *
 * @typedef {object} ListProps
 * @property {import("react").ReactNode} [children] `ListItem` elements (or other nodes rendered as list content).
 * @property {boolean} [inset] Indent the whole list one level (for nesting under a parent item) and tighten row spacing.
 */

/**
 * Bulleted list container rendering a semantic `<ul>`.
 *
 * @param {ListProps} props - Component props.
 * @returns {JSX.Element} A `<ul>` column of items.
 */
function List({ children, inset = false }) {
  return (
    <Ul style={inset ? [listBase, listInset] : listBase}>
      {children}
    </Ul>
  );
}

/**
 * Props for {@link ListItem}.
 *
 * @typedef {object} ListItemProps
 * @property {string} label Item text.
 * @property {import("react").ReactNode} [children] Nested {@link List} rendered under the label.
 * @property {string} [marker] Bullet glyph ("•" dot by default; pass a different glyph to restyle a level, e.g. "–").
 * @property {string} [markerClass] Tailwind classes for the marker glyph (defaults to the light ink tone).
 * @property {string} [textClass] Tailwind classes for the label (defaults to muted white).
 */

/**
 * Single list row rendering a semantic `<li>`: marker column + label with a
 * hanging indent, plus an optional nested list aligned under the label.
 *
 * @param {ListItemProps} props - Component props.
 * @returns {JSX.Element} An `<li>` row.
 */
function ListItem({ label, children, marker = "•", markerClass = "text-[#C9CCDD]", textClass = "text-white/60" }) {
  return (
    <Li>
      <View className="flex-row gap-2">
        <Text className={`w-3 shrink-0 font-outfit text-xs md:text-sm leading-snug ${markerClass}`}>{marker}</Text>
        <Text className={`flex-1 font-outfit text-xs md:text-sm leading-snug ${textClass}`}>{label}</Text>
      </View>
      {children ? (
        <View className="mt-1">
          {children}
        </View>
      ) : null}
    </Li>
  );
}

export { List, ListItem };
