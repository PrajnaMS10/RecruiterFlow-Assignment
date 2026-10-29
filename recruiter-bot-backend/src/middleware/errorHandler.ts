import type {ErrorRequestHandler} from 'express';
export const errorHandler:ErrorRequestHandler=(error,_req,res,_next)=>{
 console.error('Request failed:',error instanceof Error ? error.message : 'Unknown error');
 res.status(500).json({error:'Internal server error'});
};
export function parseId(value:string):number|undefined {
 if(!/^[1-9][0-9]*$/.test(value)) return undefined;
 const id=Number(value); return Number.isSafeInteger(id) ? id : undefined;
}
