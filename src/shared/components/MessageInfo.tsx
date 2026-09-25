import { Message } from 'primereact/message'

const MessageInfo = ({ title, intro }) => {
  return (
    <Message
      style={{
        border: 'solid #000',
        borderWidth: '0 0 0 6px',
        color: '#000',
        justifyContent: 'start',
      }}
      className="border-primary w-full justify-content-start"
      severity="info"
      content={(
        <div className="flex items-start">
          <i className="pi pi-info-circle" style={{ fontSize: '2rem' }} />
          <div className="ml-2"><strong className='block'>{title}, </strong>{intro}.</div>
        </div>
      )}
    />
  )
}

export default MessageInfo