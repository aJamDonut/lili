/**
 * Represents a storage folder.
 * @interface StorageFolder
 * @property {string} id - The ID of the folder.
 * @property {string} name - The name of the folder.
 */
export interface StorageFolder {
  id: string;
  name: string;
}

/**
 * Represents the interface for a storage driver.
 * @interface StorageDriverInterface
 */
export interface StorageDriverInterface {
  /**
   * Retrieves the list of folders.
   * @returns {Promise<Array<StorageFolder>>} A promise that resolves to the list of folders.
   */
  getFolders(): Promise<Array<StorageFolder>>;

  /**
   * Retrieves the list of files in a folder.
   * @param {string} folderName - The name of the folder.
   * @returns {Array<string>} The list of file names.
   */
  getFolder(folderName: string): Promise<Array<string>>;
  /**
   * Writes contents to a file.
   * @param {string} folderName - The name of the folder.
   * @param {string} fileName - The name of the file.
   * @param {string} contents - The contents to write.
   * @returns {Promise<boolean>} A promise that resolves to indicate whether the write operation was successful.
   */
  writeFile(
    folderName: string,
    fileName: string,
    contents: string
  ): Promise<boolean>;
  /**
   * Reads the contents of a file.
   * @param {string} folderName - The name of the folder.
   * @param {string} fileName - The name of the file.
   * @returns {Promise<string>} A promise that resolves to the contents of the file.
   */
  readFile(folderName: string, fileName: string): Promise<string>;
  /**
   * Reads the contents of a JSON file and parses it into an object.
   * @param {string} folderName - The name of the folder.
   * @param {string} fileName - The name of the file.
   * @returns {Promise<Object>} A promise that resolves to the parsed object from the JSON file.
   */
  readJson(folderName: string, fileName: string): Promise<Object>;

  /**
   * Delete the file
   * @param {string} folderName - The name of the folder.
   * @param {string} fileName - The name of the file.
   * @returns {Promise<Object>} A promise that resolves when deleted
   */
  deleteFile(folderName: string, fileName: string): Promise<Object>;
}
