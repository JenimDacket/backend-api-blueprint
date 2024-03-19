export type ExampleTypes = 'new' | 'old' | 'interesting' | 'helpful' | 'practice'

export type Example =
  {
    /**
     * Id is a string rather than bigint, since JSON doesn't support bigints.
     * @pattern ^\d{1,19}$
    */
   id?: number;
   /**
    * @minLength 1
    * @maxLength 200
   */
  name: string;
  /**
   * @pattern ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$
  */
 createdBy?: number | null;
 type: ExampleTypes;
      }