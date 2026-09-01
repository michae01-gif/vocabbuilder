export type Passage = {
  id: string;
  title: string;
  flavor: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  text: string;
};

export const MAX_READING_TIER = 5;

export const passages: Passage[] = [
  {
    id: "harbour-inspector",
    title: "The Harbour Inspector",
    flavor: "a quiet mystery",
    difficulty: 1,
    text: "Every morning, the harbour inspector would walk the docks with slow, deliberate steps. She paused to inspect each crate before the transport ships could carry it away, and the workers respected her careful conduct. One package, small and portable, wrapped in brown paper, attracted her attention more than the rest. She selected it from the pile and turned it over twice. Something about its weight seemed designed to attract the curious. She provided no explanation. She simply smiled and carried it off.",
  },
  {
    id: "garden-factory",
    title: "A Factory for Hope",
    flavor: "the old gardener",
    difficulty: 1,
    text: "The old gardener believed a greenhouse was a factory for hope. He supervised every seedling himself and revised his plans whenever the weather turned. The effect of his care was visible in every leaf, and he treated each new bud as evidence of progress. A garden is never perfect, he liked to say, but every season offers its own benefits if you pay attention to the small things.",
  },
  {
    id: "detective-method",
    title: "The Detective's Method",
    flavor: "from evidence to conclusion",
    difficulty: 2,
    text: "The young detective liked to proceed from evidence to conclusion, never the reverse. From a scuffed boot she could deduce a long walk; from silence she would admit nothing and omit less. Her reports never exceeded a single page, yet each line indicated where the inquiry would strike next. Her colleagues predicted she would one day deliver a verdict that rejected every easy assumption in the room. Nobody dared transmit a rumour past her desk.",
  },
  {
    id: "committee-at-dusk",
    title: "The Committee at Dusk",
    flavor: "bureaucratic theatre",
    difficulty: 2,
    text: "The committee met at dusk to construct a plan nobody wanted. The chair proposed a library, the treasurer proposed a statue, and the argument composed itself. To postpone the decision, they imposed a new rule: every motion must be deposited in writing and disposed of within a week. When a junior clerk exposed the whole scheme as unnecessary, they instructed her to draft the minutes and say nothing further.",
  },
  {
    id: "the-auction",
    title: "The Final Lot",
    flavor: "a night at the auction house",
    difficulty: 3,
    text: "At the auction, the spectators fell silent as the final lot appeared. The dealer, circumspect as ever, speculated quietly about its origins while the auctioneer tried to protract the bidding. A late offer distracted the room for a moment, but nothing could detract from the strange gravity of the painting. In retrospect, the young buyer was not reckless but introspective; she had weighed every prospect for weeks. When doubts surfaced, she did not retract her bid.",
  },
  {
    id: "scholars-room",
    title: "The Scholar's Lamp",
    flavor: "a mind at work",
    difficulty: 3,
    text: "The scholar kept a translucent lamp on her desk so its luminous glow could magnify the pages without glare. She was cognizant of her own biases, cognitive habits she called them, and wrote with a conscience so exact it bordered on prescience. Visitors assumed she was omniscient; she insisted she was merely lucid. Once, travelling incognito to a conference, she heard her own essay elucidated by a stranger who got it entirely wrong. The magnitude of the error pleased her for weeks.",
  },
  {
    id: "the-collapse",
    title: "The Rupture",
    flavor: "how the scandal broke",
    difficulty: 4,
    text: "The scandal did not erupt so much as rupture, all at once and from every side. An abrupt memo interrupted the board meeting, and the finance director, long repressed by the chairman's arrogance, began to speak. He described a corrupt arrangement designed to compress costs and silence critics, one that would disrupt the entire industry and leave the company bankrupt. He did not raise his voice. He simply refused, any longer, to be oppressed by it.",
  },
  {
    id: "the-fiduciary",
    title: "Credence",
    flavor: "a courtroom reckoning",
    difficulty: 4,
    text: "The lawyer's creed was simple: justify nothing, explain everything. Her credentials were impeccable and her fidelity to clients absolute, which made the accusation of perfidy land like perjury in open court. She refused to confide in the jury until the prosecution overstepped its jurisdiction. Then she produced a single credible witness, and the credulous silence that followed said more than any verdict could.",
  },
  {
    id: "misanthropes-feast",
    title: "The Philanthropist's Feast",
    flavor: "generosity examined",
    difficulty: 5,
    text: "The philanthropist gave feasts that no misanthrope could refuse. His toasts were extemporaneous, his vitality legendary, his wit vivacious enough to soften the most implacable guest. Watching him, you understood the anthropomorphic impulse: people gave him the qualities of a force of nature. Whether his generosity healed the psyche or was merely psychosomatic, a warmth that faded by morning, nobody could say. He remained magnanimous either way, which was perhaps the point.",
  },
  {
    id: "blood-and-water",
    title: "Blood and Water",
    flavor: "an inheritance dissolves",
    difficulty: 5,
    text: "The old families claimed consanguineous pride while nursing sanguinary grudges. Their patriarch, sanguine to the last, refused both the priest's benediction and the lawyer's plan for the dissolution of the estate. A dissolute nephew delivered a eulogy so evocative that even the nescient wept, though they could not have said for whom. It ended, as such things do, in silence and in lawyers.",
  },
];
