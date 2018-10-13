// Boot Menu Constants
export const INTRO_DISTANCE = 0.15;
export const INTRO_RADIUS = 0.018;
export const INTRO_TWEEN_DURATION = 200;
export const INTRO_TEXT_SIZE = 0.15;
export const INITIAL_TREE_WIDTH = 0.5;
export const INITIAL_TREE_HEIGHT = 0.2;

// Node Constants
export const NODE_RADIUS = 0.03;
export const NODE_SCALE = 3;
export const LINE_WIDTH = 0.004;
export const LABEL_SIZE = 1.3;
export const PAYOFF_SIZE = 1.1;
export const HOVER_COLOR = 0x555555;
export const HOVER_CHILDREN_COLOR = 0xaaaaaa;
export const NODE_SELECTED_COLOR = 0x004991;
export const PLAYER_COLORS = [0xff0000, 0x0000ff, 0x00ff00, 0xff00ff];
export const NODES_MANUAL_POS_ERROR_TEXT = 'Only a single selected node can be moved!';
export const NODES_VERTICAL_STEP_POSITIONING = 0.25;
export const NODES_HORIZONTAL_STEP_POSITIONING = 0.25;

// Selection Rectangle Constants
export const SELECTION_INNER_COLOR = 0x0389df;
export const SELECTION_BORDER_COLOR = 0x000fff;
export const PREVIEW_CIRCLE_COLOR = 0xff0000;
export const OVERLAY_SCALE = 3;

// ISets
export const SAME_PATH_ON_ROOT_ERROR_TEXT = 'Cannot create an information set for \n nodes which share a path to the root.';
export const NODES_MISSING_PLAYERS_ERROR_TEXT = 'Cannot create information set for \n nodes which do not have player assigned.';
export const NODES_DIFFERENT_PLAYERS_ERROR_TEXT = 'Cannot create information set for \n nodes which have different players.';
export const NODES_NUMBER_OF_CHILDREN_ERROR_TEXT = 'Cannot create information set for' +
  ' \n nodes which have different number of children or are leaves.';
export const IMPERFECT_RECALL_ERROR_TEXT = 'The game tree does not have perfect recall';
export const ISET_LINE_WIDTH = 0.05;

// Hover Button Colors
export const PLUS_BUTTON_COLOR = 0x00ff00;
export const MINUS_BUTTON_COLOR = 0xff0000;
export const LINK_BUTTON_COLOR = 0x0000ff;
export const UNLINK_BUTTON_COLOR = 0xff9f00;
export const CUT_BUTTON_COLOR = 0x07c986;
export const PLAYER_BUTTON_COLOR = 0x999999;
export const CUT_SPRITE_TINT = 0x444444;

// Misc
export const ERROR_MESSAGE_COLOR = 0xff4545;
export const TREE_TWEEN_DURATION = 600;
export const GTE_DEFAULT_FILE_NAME = 'GTE_Tree';

// Strategic Form
export const CELL_WIDTH = 0.15;
export const CELL_STROKE_WIDTH = 0.05;
export const CELL_NUMBER_SIZE = 0.3;
export const PLAYER_TEXT_SIZE = 0.35;
export const MOVES_OFFSET = 0.1;
export const MOVES_TEXT_SIZE = 0.25;
export const STRATEGIC_PLAYERS_ERROR_TEXT = 'Strategic form only available for 2 players!';
export const STRATEGIC_NOT_LABELED_ERROR_TEXT = 'Not all nodes are owned or chance!';
export const STRATEGIC_FORM_DELIMITER = ' ';

// Other constants
export const MAX_RANDOM_PAYOFFS = 21;

