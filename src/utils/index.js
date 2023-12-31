const trackPlaylistAction = (queryResult) => {
  let action;

  if (queryResult.command === 'INSERT') {
    action = 'add';
  }

  if (queryResult.command === 'DELETE') {
    action = 'delete';
  }

  return action;
};

module.exports = { trackPlaylistAction };
