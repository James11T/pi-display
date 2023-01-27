export interface Tokens {
  access_token: string;
  token_type: "Bearer";
  scope: string;
  expires_in: number;
  refresh_token: string;
}

export interface Device {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

export interface Image {
  url: string;
  height: number;
  width: number;
}

export interface Album {
  album_type: string;
  artists: Artist[];
  available_markets: string[];
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  release_date_precision: "year" | "month" | "day";
  total_tracks: number;
  restrictions?: {
    reason: "market" | "product" | "explicity";
  };
  type: "album";
  uri: string;
}

export interface Artist {
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  name: string;
  type: "artist";
  uri: string;
}

export interface HydratedArtist extends Artist {
  followers: {
    href: null;
    total: number;
  };
  genres: string[];
  images: Image[];
  popularity: number;
}

export interface Track<A extends Artist = Artist> {
  album: Album;
  artists: A[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: {
    isrc: string;
    ean: string;
    upc: string;
  };
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  restrictions?: {
    reason: "market" | "product" | "explicity";
  };
  popularity: number;
  preview_url: string;
  track_number: number;
  type: "track";
  uri: string;
}

export interface Actions {
  interrupting_playback?: boolean;
  pausing?: boolean;
  resuming?: boolean;
  seeking?: boolean;
  skipping_next?: boolean;
  skipping_prev?: boolean;
  toggling_repeat_context?: boolean;
  toggling_shuffle?: boolean;
  toggling_repeat_track?: boolean;
  transferring_playback?: boolean;
}

export interface PlaybackState {
  device: Device;
  shuffle_state: boolean;
  repeat_state: "off" | "track" | "context";
  timestamp: number;
  context?: {
    type: "string";
    href: string;
    external_urls: {
      spotify: string;
    };
    uri: string;
  };
  progress_ms: number;
  item?: Track;
  is_playing: boolean;
  currently_playing_type: "track" | "episode" | "ad" | "unknown";
  actions: {
    allows?: Actions;
    disallows?: Actions;
  };
}

export interface Queue {
  currently_playing: Track;
  queue: Track[];
}
