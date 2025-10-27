import prisma from './prisma'

export class DatasetService {

  static async saveUserFile(
    userId: string, 
    file: File, 
    name: string,
    description?: string
  ) {
    const content = await file.text()
    
    return await prisma.userDataset.create({
      data: {
        name: name || file.name.replace('.csv', ''),
        fileName: file.name,
        fileSize: file.size,
        description,
        content,
        userId
      }
    })
  }

  static async getUserFiles(userId: string) {
    return await prisma.userDataset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
  }

  static async getUserFile(userId: string, fileId: string) {
    return await prisma.userDataset.findFirst({
      where: {
        id: fileId,
        userId: userId
      }
    })
  }

  static async deleteUserFile(userId: string, fileId: string) {
    return await prisma.userDataset.deleteMany({
      where: {
        id: fileId,
        userId: userId
      }
    })
  }
}