import Stats from "../utils/Stats";

export default function initStats() {
  let stats =  Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
  return stats;
}
