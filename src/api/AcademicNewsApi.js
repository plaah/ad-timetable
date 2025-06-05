// gunakan RSS-to-JSON service sementara
export default class AcademicNewsApi {
  async getLatestNews() {
    const res = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https://example.com/academic-news.xml");
    const data = await res.json();
    return data.items.map(item => ({
      title: item.title,
      content: item.description
    }));
  }
}
