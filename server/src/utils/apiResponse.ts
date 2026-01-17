import type { Response } from "express"

export class ApiResponse {

    static success(res: Response, message: string, data?: any) {
        return res.status(200).json({
            success: true,
            message,
            data: data ?? null
        })
    }

    static created(res: Response, message: string, data?: any) {
        return res.status(201).json({
            success: true,
            message: `${message} created successfully`,
            data: data ?? null
        })
    }

    static noContent(res: Response) {
        return res.status(204).send();
    }

    static error(res: Response, message: string, errors?: any){
        res.status(500).json({
            success: false,
            message,
            errors: errors ?? null
        })
    }

    static badRequest(res: Response) {
        return res.status(400).json({
            successs: false,
            message: "Bad Request"
        })
    }

    static unauthorized(res: Response, message: string){
        res.status(401).json({
            success: false,
            message
        })
    }

    static notFound(res: Response, message: string){
        res.status(404).json({
            success: false,
            message: `${message} not found`
        })
    }

    static validationError(res: Response, message: string, errors?: any){
        return res.status(422).json({
            success: false,
            message,
            errors: errors ?? null
        })
    }
}