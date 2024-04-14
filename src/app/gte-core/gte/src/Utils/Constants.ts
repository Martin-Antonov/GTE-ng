export const GTE_VERSION = 'GTE v2.3.0';

// Boot Menu Constants
export const INITIAL_TREE_WIDTH = 0.5;
export const INITIAL_TREE_HEIGHT = 0.2;

// Node Constants
export const NODE_RADIUS = 0.0135; // of height
export const CHANCE_NODE_SCALE = 2.3;
export const PREVIEW_CIRCLE_SCALE = 1.8;
export const PREVIEW_CIRCLE_COLOR = 0x0389df;
export const LINE_WIDTH = 0.004;
export const LABEL_SIZE = 1.25;
export const PAYOFF_SIZE = 1;
export const PLAYER_COLORS = ['#ff0000', '#0000ff', '#00bb00', '#ff00ff'];
export const PLAYER_COLORS_NUMBER = [0xff0000, 0x0000ff, 0x00bb00, 0xff00ff];
export const NODES_VERTICAL_STEP_POSITIONING = 0.166667;
export const NODES_HORIZONTAL_STEP_POSITIONING = 0.166667;

// Selection Rectangle Constants
export const SELECTION_INNER_COLOR = 0x0389df;
export const OVERLAY_SCALE = 3;

// Errors
export const SAME_PATH_ON_ROOT_ERROR_TEXT = 'Cannot create an information set for nodes which share a path to the root.';
export const NODES_CONTAIN_CHANCE_PLAYER = 'Cannot create an information set for node(s) which are owned by a chance player.';
export const NODES_DIFFERENT_PLAYERS_ERROR_TEXT = 'Cannot create an information set for nodes which have different players.';
export const NODES_NUMBER_OF_CHILDREN_ERROR_TEXT = 'Cannot create an information set for nodes which have different number of ' +
  'children or are leaves.';
export const IMPERFECT_RECALL_ERROR_TEXT = 'The game tree does not have perfect recall';
export const BACKWARDS_INDUCTION_NOT_ALL_LABELED = 'Not all nodes have a player assigned';
export const BACKWARDS_INDUCTION_PERFECT_INFORMATION = 'Cannot calculate SPNE/BFI for games with imperfect information.';

// ISets
export const ISET_LINE_WIDTH = 0.05;

// Misc
export const TREE_TWEEN_DURATION = 600;

// Strategic Form
export const STRATEGIC_NOT_LABELED_ERROR_TEXT = 'Not all nodes are owned by a player!';
export const STRATEGIC_FORM_DELIMITER = ' ';

// Other constants
export const MAX_RANDOM_PAYOFFS = 21;
export const CLICK_THRESHOLD = 200;
export const MAX_NODES_COUNT_FOR_STRATEGIC_FORM = 22;
