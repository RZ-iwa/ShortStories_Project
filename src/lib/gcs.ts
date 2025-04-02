export type Story = {
  id: string;
  title: string;
  publishDate: string;
  fileUrl: string;
  wordCount: number;
  category: string;
};

const STORIES_BUCKET_URL = 'https://storage.googleapis.com/short-stories-bucket';

export const getStories = async (): Promise<Story[]> => {
  try {
    const response = await fetch(`${STORIES_BUCKET_URL}?prefix=`);
    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");
    const contents = xmlDoc.getElementsByTagName("Contents");
    const stories: Story[] = [];
    
    for (let i = 0; i < contents.length; i++) {
      const key = contents[i].getElementsByTagName("Key")[0]?.textContent;
      const lastModified = contents[i].getElementsByTagName("LastModified")[0]?.textContent;
      
      if (key && lastModified && key.endsWith('.pdf')) {
        const fileName = key.split('/').pop()?.replace('.pdf', '') || '';
        const [title, wordCountStr, category] = fileName.split('_');
        
        const story = {
          id: `story-${i}`,
          title: title,
          publishDate: lastModified.split('T')[0],
          fileUrl: `${STORIES_BUCKET_URL}/${key}`,
          wordCount: parseInt(wordCountStr) || 0,
          category: category || 'その他'
        };
        stories.push(story);
      }
    }
    
    return stories;
  } catch (error) {
    console.error('GCS fetch error:', error);
    return [];
  }
};
