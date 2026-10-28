import type { Project } from '../../types.ts'

/** LEC — dados do README e do código de decoarc/Local_Email_Client-LEC. */
export const localEmailClient: Project = {
  slug: 'local-email-client',
  title: 'Local Email Client',
  type: 'verified',
  status: 'published',
  summary:
    'LEC, a Windows app that opens Outlook Express profiles straight from disk, reads their .dbx mail stores and reorganizes them, with no accounts and no server.',
  role: 'Solo developer',
  year: '2026',
  stack: ['C#', '.NET 9', 'WPF', 'WebView2', 'MimeKit'],
  cover: {
    src: '/images/projects/local-email-client.webp',
    alt: 'Local Email Client window — the folder tree of an example profile beside the message list, with one message open in the reading pane',
    width: 1024,
    height: 609,
    thumbSrc: '/images/projects/local-email-client-800.webp',
  },
  sections: [
    {
      heading: 'Problem and motivation',
      paragraphs: [
        'Outlook Express kept every mail folder in its own .dbx file, an undocumented binary format, and old archives still sit on disk in that form long after the program was retired.',
        'LEC opens those profiles directly (the folder that holds Folders.dbx and one .dbx per folder) so the messages can be read, searched and reorganized. It works only on files already on disk: no accounts, no sending, no sync.',
      ],
    },
    {
      heading: 'Role and contributions',
      items: [
        'Wrote the .dbx reader and writer as a standalone library (LEC.DbxFormat): header, index tree, message blocks and folder records.',
        'Built the mail store layer (LEC.MailStore) for profiles, folders, messages, duplicate detection, caches and backups.',
        'Built the WPF window on an MVVM structure: folder tree, sortable message list, HTML reading pane in WebView2 and attachments that can be saved one by one.',
        'Added the LEC.Cli tool: dump lists the folders or messages of a single .dbx, extract writes each message as an .eml file.',
      ],
    },
    {
      heading: 'Engineering decisions',
      items: [
        'Keep the format, the store and the window in separate projects, so the .dbx code runs from the command line without opening the app.',
        'Back up before every rewrite: the first state is kept as file.original and never replaced, and the copy from right before the rewrite is file.bak.',
        'Remove a deleted or moved message from the list at once, but leave its bytes in the .dbx until the folder is compacted, tracked meanwhile in a local cache.',
        'Keep the Outlook Express special folders (Inbox, Sent Items, Drafts and the rest) in place when folders are created, moved or deleted.',
        'Set defensive limits against corrupted files (index tree depth, message fragments, message size), generous enough for large, decades-old mailboxes.',
      ],
    },
    {
      heading: 'Technical challenges',
      items: [
        'Working against a reverse-engineered binary format, where a wrong offset corrupts a mailbox without raising any error.',
        'Recovering messages a damaged folder no longer indexes: a scavenger scans the file for message-block headers that point to their own offset and carry the fixed capacity marker, a pattern checked against 1,639 real headers.',
        'Moving messages between two open profiles, each with its own files, caches and pending compaction.',
        'Warning before a profile or the program closes while folders still need compacting, so removed messages do not linger in the file unnoticed.',
      ],
    },
    {
      heading: 'Results and current status',
      items: [
        'Opens several profiles side by side, reads messages as HTML with their attachments, searches by sender, subject or body, flags duplicates and compacts folders.',
        'Runs on 64-bit Windows 10 and 11. There is no packaged release yet: it is built from source with the .NET 9 SDK and uses the WebView2 Runtime for the reading pane.',
        'Remote images inside HTML messages are loaded, a known trade-off of the reading pane.',
      ],
    },
  ],
  links: [
    { kind: 'repo', href: 'https://github.com/decoarc/Local_Email_Client-LEC' },
  ],
}
