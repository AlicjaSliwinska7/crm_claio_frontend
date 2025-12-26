// ...importy bez zmian
const TAG_CLASSES = ['kb__chip--blue','kb__chip--green','kb__chip--purple','kb__chip--teal','kb__chip--pink','kb__chip--indigo','kb__chip--sky','kb__chip--orange'];

export default function KbArticleView({ article }) {
  if (!article) return null;
  return (
    <div className="kbArticle">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
        <h2 style={{margin:0}}>{article.title}</h2>

        {/* akcje */}
        <div className="kb__btns">
          <button className="btn btn--ghost">Udostępnij</button>
          <button className="btn btn--primary">Edytuj</button>
        </div>
      </div>

      {/* meta/chipy */}
      <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8}}>
        <span className={`kb__chip kb__status kb__status--${article.status}`}>{article.status}</span>
        {article.category && <span className="kb__chip kb__chip--indigo">{article.category}</span>}
        {article.validUntil && <span className="kb__chip kb__chip--amber">przegląd: {article.validUntil}</span>}
      </div>

      {/* tagi */}
      {!!(article.tags && article.tags.length) && (
        <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:8}}>
          {article.tags.map((t,i)=>(
            <span key={t} className={`kb__chip ${TAG_CLASSES[i % TAG_CLASSES.length]}`}>#{t}</span>
          ))}
        </div>
      )}

      {/* divider + treść */}
      <div className="kb__divider"></div>
      <div className="kb__content" dangerouslySetInnerHTML={{ __html: article.content }} />

      {/* ewentualny dół (załączniki itp.) */}
      {article.attachments?.length ? (
        <>
          <div className="kb__sectionTitle">Załączniki</div>
          <ul style={{margin:'6px 0 0 18px'}}>
            {article.attachments.map(f => <li key={f.id}><a href={f.url}>{f.name}</a></li>)}
          </ul>
        </>
      ) : null}
    </div>
  );
}
