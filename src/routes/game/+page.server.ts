import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (({ url }) => {
  let startvalue = url.searchParams.get('startvalue') || '';
  let players = url.searchParams.getAll('player');

  if (startvalue == '' || !parseInt(startvalue) || players.length < 2) {
    redirect(307, '/');
  }

  return {
    startvalue: parseInt(startvalue),
    players: players,
  };
}) satisfies PageServerLoad;
