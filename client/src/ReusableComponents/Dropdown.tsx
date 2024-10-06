import React from 'react'

interface Props{
    items : Item[]
}

interface Item{
    item : any,
    event : () => void,
    fontSize : number,
    fontColor : string,
    fontWeight : number,
    icon : any
}

const Dropdown = (Props : Props) => {

  return (
    <div className='flex flex-col bg-white rounded shadow p-2 gap-2'>
       {
        Props?.items.map((item : Item, index)=>{
            return (
                <button className='flex gap-2 items-center' onClick={item.event} key={index}>
                    {item.icon}
                    <p className=' whitespace-nowrap' style={{fontSize: `${item.fontSize}px`, fontWeight: `${item.fontWeight}`, color: `${item.fontColor}`}}>{item.item}</p>
                </button>
            )
        })
       }
    </div>
  )
}

export default Dropdown