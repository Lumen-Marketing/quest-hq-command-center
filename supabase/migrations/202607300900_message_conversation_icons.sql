-- Group chats carry their own icon: a built-in glyph key or a compressed uploaded
-- image, mirroring how companies.icon_key / companies.icon_image already work for
-- workspace icons. Direct chats keep showing the other participant's avatar and do
-- not use these columns.
--
-- The image is a data URL the client has already square-cropped to 192px and
-- quality-stepped (workspaceIconFileToDataUrl), so it lands well under 100 KB in
-- practice. The check constraint is a backstop against the column being used as a
-- general blob store, not the working limit.

alter table public.message_conversations
  add column if not exists icon_key text not null default '',
  add column if not exists icon_image text not null default '';

alter table public.message_conversations
  drop constraint if exists message_conversations_icon_image_size_check;
alter table public.message_conversations
  add constraint message_conversations_icon_image_size_check
  check (pg_column_size(icon_image) <= 512 * 1024);

-- Only a data URL for the three raster types the client produces; never a remote
-- reference, so a conversation icon can't be used to beacon out to another host.
alter table public.message_conversations
  drop constraint if exists message_conversations_icon_image_format_check;
alter table public.message_conversations
  add constraint message_conversations_icon_image_format_check
  check (
    icon_image = ''
    or icon_image ~ '^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$'
  );
