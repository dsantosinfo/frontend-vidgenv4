import { VideoTemplate } from '../types';

export const VIDEO_TEMPLATES: Record<string, VideoTemplate> = {
  instagram_story: { name: 'instagram_story', width: 1080, height: 1920, fps: 24, aspectRatio: '9/16', description: 'Instagram Story' },
  instagram_feed: { name: 'instagram_feed', width: 1080, height: 1350, fps: 24, aspectRatio: '4/5', description: 'Instagram Feed' },
  facebook_feed: { name: 'facebook_feed', width: 1200, height: 630, fps: 24, aspectRatio: '16/9', description: 'Facebook Feed' },
  youtube_thumbnail: { name: 'youtube_thumbnail', width: 1280, height: 720, fps: 24, aspectRatio: '16/9', description: 'YouTube' },
  tiktok: { name: 'tiktok', width: 1080, height: 1920, fps: 24, aspectRatio: '9/16', description: 'TikTok' },
  custom: { name: 'custom', width: 1920, height: 1080, fps: 24, aspectRatio: '16/9', description: 'Custom' },
};

export const getTemplateWidth = (template: string): number =>
  VIDEO_TEMPLATES[template]?.width ?? 1080;
