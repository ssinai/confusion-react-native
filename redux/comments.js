import * as ActionTypes from './ActionTypes';

export const comments = (state = { errMess: null, comments:[]}, action) => {
  switch (action.type) {
    case ActionTypes.ADD_COMMENTS:
      return {...state, errMess: null, comments: action.payload};

    case ActionTypes.COMMENTS_FAILED:
      return {...state, errMess: action.payload};

    case ActionTypes.ADD_COMMENT:
      // find max comment id and increase by 1
      const ids = state.comments.map(comment => comment.id);
      const max_id = Math.max(...ids);
      action.payload.id=max_id+1;

      const newComments = state.comments.concat(action.payload);
      return {...state, errMess: null, comments: newComments};

    default:
      return state;
  }
};
